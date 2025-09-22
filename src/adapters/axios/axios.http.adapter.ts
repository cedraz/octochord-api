import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import axios, { AxiosInstance, isAxiosError } from 'axios';
import {
  HttpRequestConfig,
  IHttpProvider,
} from 'src/shared/domain/providers/http.provider';

@Injectable()
export class AxiosHttpAdapter implements IHttpProvider {
  private readonly api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async get<T>(url: string, config?: HttpRequestConfig): Promise<T> {
    try {
      const response = await this.api.get<T>(url, config);
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        throw new ServiceUnavailableException(
          `Error fetching data from ${url}: ${error.message}`,
        );
      }
      throw error;
    }
  }

  async post<T>(
    url: string,
    data: any,
    config?: HttpRequestConfig,
  ): Promise<T> {
    try {
      const response = await this.api.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        throw new ServiceUnavailableException(
          `Error posting data to ${url}: ${error.message}`,
        );
      }
      throw error;
    }
  }

  async put<T>(url: string, data: any, config?: HttpRequestConfig): Promise<T> {
    try {
      const response = await this.api.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        throw new ServiceUnavailableException(
          `Error updating data at ${url}: ${error.message}`,
        );
      }
      throw error;
    }
  }

  async delete<T>(url: string, config?: HttpRequestConfig): Promise<T> {
    try {
      const response = await this.api.delete<T>(url, config);
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        throw new ServiceUnavailableException(
          `Error deleting data from ${url}: ${error.message}`,
        );
      }
      throw error;
    }
  }
}
