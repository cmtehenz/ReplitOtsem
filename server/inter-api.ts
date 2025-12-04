import https from "https";
import tls from "tls";
import axios, { AxiosInstance } from "axios";
import crypto from "crypto";
import forge from "node-forge";

const INTER_API_URL = "https://cdpj.partners.bancointer.com.br";
const INTER_OAUTH_URL = `${INTER_API_URL}/oauth/v2/token`;

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface PixCharge {
  calendario: {
    expiracao: number;
  };
  devedor?: {
    cpf?: string;
    cnpj?: string;
    nome: string;
  };
  valor: {
    original: string;
  };
  chave: string;
  solicitacaoPagador?: string;
  infoAdicionais?: Array<{ nome: string; valor: string }>;
}

interface PixChargeResponse {
  txid: string;
  revisao: number;
  loc: {
    id: number;
    location: string;
    tipoCob: string;
  };
  location: string;
  status: string;
  devedor?: {
    cpf?: string;
    cnpj?: string;
    nome: string;
  };
  valor: {
    original: string;
  };
  chave: string;
  pixCopiaECola: string;
  calendario: {
    criacao: string;
    expiracao: number;
  };
}

interface PixPayment {
  endToEndId: string;
  txid: string;
  valor: string;
  horario: string;
  pagador?: {
    cpf?: string;
    cnpj?: string;
    nome: string;
  };
}

interface WithdrawalRequest {
  valor: string;
  chave: string;
  descricao?: string;
}

class InterAPIClient {
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;
  private axiosInstance: AxiosInstance;

  private fixPemFormat(pem: string, type: string): string {
    // First, handle escaped newlines
    pem = pem.replace(/\\n/g, '\n');
    
    // Detect the actual type from the PEM content
    const typeMatch = pem.match(/-----BEGIN ([^-]+)-----/);
    if (typeMatch) {
      const detectedType = typeMatch[1];
      console.log(`[Inter API] Detected PEM type: ${detectedType}`);
      
      // Check if already properly formatted
      if (pem.includes(`-----BEGIN ${detectedType}-----\n`) && pem.includes(`\n-----END ${detectedType}-----`)) {
        return pem;
      }
      
      // Use detected type for markers
      const beginMarker = `-----BEGIN ${detectedType}-----`;
      const endMarker = `-----END ${detectedType}-----`;
      
      // Remove existing markers and whitespace
      let content = pem
        .replace(/-----BEGIN [^-]+-----/g, '')
        .replace(/-----END [^-]+-----/g, '')
        .replace(/\s+/g, '');
      
      // Format base64 content with 64-character lines
      const lines: string[] = [];
      for (let i = 0; i < content.length; i += 64) {
        lines.push(content.substring(i, i + 64));
      }
      
      return `${beginMarker}\n${lines.join('\n')}\n${endMarker}`;
    }
    
    // Fallback for content without markers
    const beginMarker = `-----BEGIN ${type}-----`;
    const endMarker = `-----END ${type}-----`;
    
    let content = pem.replace(/\s+/g, '');
    
    const lines: string[] = [];
    for (let i = 0; i < content.length; i += 64) {
      lines.push(content.substring(i, i + 64));
    }
    
    return `${beginMarker}\n${lines.join('\n')}\n${endMarker}`;
  }

  private convertPrivateKeyForOpenSSL3(pemKey: string): string {
    try {
      console.log("[Inter API] Analyzing private key...");
      
      // Log key metadata for debugging (not the actual key content)
      const keyLines = pemKey.split('\n');
      console.log("[Inter API] Key structure:");
      console.log("  - Total lines:", keyLines.length);
      console.log("  - First line:", keyLines[0]);
      console.log("  - Last line:", keyLines[keyLines.length - 1]);
      
      // Try to detect key type using Node's crypto
      try {
        const keyObject = crypto.createPrivateKey({
          key: pemKey,
          format: 'pem',
        });
        
        const keyType = keyObject.asymmetricKeyType;
        console.log("[Inter API] Key type detected:", keyType);
        
        // Export the key in a compatible format
        const exportedKey = keyObject.export({
          type: 'pkcs8',
          format: 'pem',
        });
        
        console.log("[Inter API] Key exported successfully in PKCS#8 format");
        return exportedKey as string;
      } catch (cryptoError: any) {
        console.log("[Inter API] Node crypto failed:", cryptoError.message);
        console.log("[Inter API] Error code:", cryptoError.code);
        
        // If the issue is with the key format, try to parse it differently
        if (cryptoError.code === 'ERR_OSSL_UNSUPPORTED') {
          console.log("[Inter API] Key uses unsupported algorithm - attempting node-forge parsing...");
        }
      }
      
      // Fallback to node-forge for RSA keys
      if (pemKey.includes('RSA PRIVATE KEY')) {
        console.log("[Inter API] Detected RSA format, using node-forge...");
        const privateKey = forge.pki.privateKeyFromPem(pemKey);
        const rsaPrivateKeyPem = forge.pki.privateKeyToPem(privateKey);
        console.log("[Inter API] RSA key converted successfully");
        return rsaPrivateKeyPem;
      }
      
      return pemKey;
    } catch (error: any) {
      console.log("[Inter API] Key conversion failed:", error.message);
      return pemKey;
    }
  }

  constructor() {
    let privateKey = process.env.INTER_PRIVATE_KEY;
    let certificate = process.env.INTER_CERTIFICATE;

    if (!privateKey || !certificate) {
      throw new Error("INTER_PRIVATE_KEY and INTER_CERTIFICATE must be set");
    }

    // Fix PEM format - handle various ways certificates might be stored
    privateKey = this.fixPemFormat(privateKey, 'PRIVATE KEY');
    certificate = this.fixPemFormat(certificate, 'CERTIFICATE');
    
    // Convert private key to OpenSSL 3.x compatible format using node-forge
    privateKey = this.convertPrivateKeyForOpenSSL3(privateKey);

    console.log("[Inter API] Certificate format check:");
    console.log("  - Has proper header:", certificate.includes('-----BEGIN CERTIFICATE-----\n'));
    console.log("  - Has proper footer:", certificate.includes('\n-----END CERTIFICATE-----'));
    console.log("[Inter API] Private key format check:");
    console.log("  - Has proper header:", privateKey.includes('-----BEGIN') && privateKey.includes('KEY-----\n'));
    console.log("  - Is encrypted:", privateKey.includes('ENCRYPTED'));

    // Try to create secure context with different options
    let httpsAgent: https.Agent;
    
    try {
      // Create a secure context with explicit key handling
      const secureContext = tls.createSecureContext({
        key: privateKey,
        cert: certificate,
      });
      
      httpsAgent = new https.Agent({
        secureContext,
        rejectUnauthorized: true,
      });
      console.log("[Inter API] HTTPS agent created with secure context");
    } catch (error: any) {
      console.log("[Inter API] Secure context failed:", error.message);
      console.log("[Inter API] Trying with direct key/cert...");
      
      try {
        // Try with legacy options
        httpsAgent = new https.Agent({
          key: privateKey,
          cert: certificate,
          rejectUnauthorized: true,
          secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
        });
        console.log("[Inter API] HTTPS agent created with legacy options");
      } catch (innerError: any) {
        console.log("[Inter API] Legacy options also failed:", innerError.message);
        // Final fallback - create agent with explicit crypto settings
        httpsAgent = new https.Agent({
          key: privateKey,
          cert: certificate,
          rejectUnauthorized: true,
          ciphers: 'DEFAULT:@SECLEVEL=0',
        });
        console.log("[Inter API] HTTPS agent created with reduced security level");
      }
    }

    this.axiosInstance = axios.create({
      baseURL: INTER_API_URL,
      httpsAgent,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 60000) {
      return this.accessToken;
    }

    const clientId = process.env.INTER_CLIENT_ID;
    const clientSecret = process.env.INTER_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("INTER_CLIENT_ID and INTER_CLIENT_SECRET must be set");
    }

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("client_secret", clientSecret);
    params.append("grant_type", "client_credentials");
    params.append("scope", "cob.read cob.write cobv.read cobv.write pix.read pix.write webhook.read webhook.write");

    try {
      console.log("[Inter API] Requesting OAuth token...");
      const response = await this.axiosInstance.post<TokenResponse>(
        "/oauth/v2/token",
        params.toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiresAt = Date.now() + response.data.expires_in * 1000;
      console.log("[Inter API] OAuth token obtained successfully, expires in:", response.data.expires_in, "seconds");

      return this.accessToken;
    } catch (error: any) {
      console.error("[Inter API] Failed to get access token:");
      console.error("  Status:", error.response?.status);
      console.error("  Data:", JSON.stringify(error.response?.data, null, 2));
      console.error("  Message:", error.message);
      if (error.code) {
        console.error("  Error code:", error.code);
      }
      throw new Error(`Failed to authenticate with Banco Inter API: ${error.response?.data?.error_description || error.message}`);
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      const token = await this.getAccessToken();
      return {
        success: true,
        message: "Successfully connected to Banco Inter API",
        details: {
          tokenObtained: !!token,
          expiresAt: new Date(this.tokenExpiresAt).toISOString(),
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        details: {
          hasClientId: !!process.env.INTER_CLIENT_ID,
          hasClientSecret: !!process.env.INTER_CLIENT_SECRET,
          hasPrivateKey: !!process.env.INTER_PRIVATE_KEY,
          hasCertificate: !!process.env.INTER_CERTIFICATE,
          hasPixKey: !!process.env.INTER_PIX_KEY,
        }
      };
    }
  }

  private async request<T>(method: string, path: string, data?: any): Promise<T> {
    const token = await this.getAccessToken();

    try {
      const response = await this.axiosInstance.request<T>({
        method,
        url: path,
        data,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error(`Inter API error [${method} ${path}]:`, error.response?.data || error.message);
      throw error;
    }
  }

  async createPixCharge(txid: string, charge: PixCharge): Promise<PixChargeResponse> {
    return this.request<PixChargeResponse>("PUT", `/pix/v2/cob/${txid}`, charge);
  }

  async getPixCharge(txid: string): Promise<PixChargeResponse> {
    return this.request<PixChargeResponse>("GET", `/pix/v2/cob/${txid}`);
  }

  async listPixPayments(startDate: string, endDate: string): Promise<{ pix: PixPayment[] }> {
    return this.request("GET", `/pix/v2/pix?inicio=${startDate}&fim=${endDate}`);
  }

  async getPixPayment(e2eId: string): Promise<PixPayment> {
    return this.request<PixPayment>("GET", `/pix/v2/pix/${e2eId}`);
  }

  async sendPixWithdrawal(withdrawal: WithdrawalRequest): Promise<{ endToEndId: string }> {
    return this.request("POST", "/pix/v2/pix", {
      valor: withdrawal.valor,
      pagador: {
        chave: process.env.INTER_PIX_KEY || "",
        infoPagador: withdrawal.descricao || "Saque Otsem Pay",
      },
      favorecido: {
        chave: withdrawal.chave,
      },
    });
  }

  async configureWebhook(webhookUrl: string, pixKey: string): Promise<void> {
    await this.request("PUT", `/pix/v2/webhook/${pixKey}`, {
      webhookUrl,
    });
  }

  async getWebhook(pixKey: string): Promise<{ webhookUrl: string }> {
    return this.request("GET", `/pix/v2/webhook/${pixKey}`);
  }
}

let interClient: InterAPIClient | null = null;

export function getInterClient(): InterAPIClient {
  if (!interClient) {
    interClient = new InterAPIClient();
  }
  return interClient;
}

export { InterAPIClient, PixCharge, PixChargeResponse, PixPayment, WithdrawalRequest };
