import https from "https";
import axios, { AxiosInstance } from "axios";

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

  constructor() {
    const privateKey = process.env.INTER_PRIVATE_KEY;
    const certificate = process.env.INTER_CERTIFICATE;

    if (!privateKey || !certificate) {
      throw new Error("INTER_PRIVATE_KEY and INTER_CERTIFICATE must be set");
    }

    const httpsAgent = new https.Agent({
      key: privateKey,
      cert: certificate,
      rejectUnauthorized: true,
    });

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

      return this.accessToken;
    } catch (error: any) {
      console.error("Failed to get Inter access token:", error.response?.data || error.message);
      throw new Error("Failed to authenticate with Banco Inter API");
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
