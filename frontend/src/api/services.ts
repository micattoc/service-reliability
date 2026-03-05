import client from './client';
import type { EnvironmentGroup, ServiceHistory, ServiceStatus } from '../types';

export async function getAllServices(): Promise<ServiceStatus[]> {
  const response = await client.get<ServiceStatus[]>('/api/services/');
  return response.data;
}

export async function getServicesByEnvironment(): Promise<EnvironmentGroup[]> {
  const response = await client.get<EnvironmentGroup[]>('/api/services/by-environment');
  return response.data;
}

export async function getServiceHistory(
  serviceId: number,
  limit = 5
): Promise<ServiceHistory> {
  const response = await client.get<ServiceHistory>(`/api/services/${serviceId}/history`, { params: { limit } });
  return response.data;
}