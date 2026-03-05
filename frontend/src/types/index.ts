
export interface CheckResult {
  id: number;
  service_id: number;
  checked_at: string;
  http_status: number | null;
  latency_ms: number | null;
  actual_version: string | null;
  indicator: string | null;
  is_drifted: boolean;
  is_up: boolean;
}

export interface ServiceStatus {
  id: number;
  name: string;
  url: string;
  environment: string;
  expected_version: string | null;
  latest_check: CheckResult | null;
}

/*
export interface ServiceHistory {
  service: ServiceStatus;
  history: CheckResult[];
}
*/

export interface EnvironmentGroup {
  environment: string;
  services: ServiceStatus[];
}
