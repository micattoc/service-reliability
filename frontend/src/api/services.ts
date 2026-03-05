import client from './client';
import type { EnvironmentGroup, ServiceStatus } from '../types';

export async function getAllServices(): Promise<ServiceStatus[]> {
  const response = await client.get<ServiceStatus[]>('/api/services/');
  return response.data;
}

export async function getServicesByEnvironment(): Promise<EnvironmentGroup[]> {
  const response = await client.get<EnvironmentGroup[]>('/api/services/by-environment');
  return response.data;
}
