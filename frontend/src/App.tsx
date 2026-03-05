import { useCallback, useEffect, useState } from 'react';

import { 
  AppBar, 
  Box, 
  CircularProgress, 
  Container, 
  Grid, 
  Toolbar, 
  Typography, 
  Alert, 
  Chip 
} from '@mui/material';

import { getAllServices } from './api/services';
import { EnvironmentFilter } from './components/EnvironmentFilter';
import { ServiceCard } from './components/ServiceCard';
import type { ServiceStatus } from './types';

const REFRESH_MS = 15_000;

export default function App() {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEnv, setSelectedEnv] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchServices = useCallback(() => {
    getAllServices()
      .then((data) => {
        setServices(Array.isArray(data) ? data : []);
        setLastUpdated(new Date());
        setError(null);
      })
      .catch(() => setError('Cannot reach the backend.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchServices();

    const interval = setInterval(fetchServices, REFRESH_MS);
    return () => clearInterval(interval);

  }, [fetchServices]);

  const environments = Array.from(new Set(services.map((s) => s.environment))).sort();

  const visible = selectedEnv
    ? services.filter((s) => s.environment === selectedEnv)
    : services;

  const upCount = visible.filter((s) => s.latest_check?.is_up).length;
  const downCount = visible.filter((s) => s.latest_check && !s.latest_check.is_up).length;
  const pendingCount = visible.filter((s) => !s.latest_check).length;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100' }}>

      <AppBar position="sticky" color="default" elevation={1}>

        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight={700}>
            🛡 Service Reliability Monitor
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Chip label={`${upCount} UP`} color="success" size="small" />

            <Chip label={`${downCount} DOWN`} color="error" size="small" />

            {pendingCount > 0 && (
              <Chip label={`${pendingCount} pending`} size="small" />
            )}
            
            {lastUpdated && (
              <Typography variant="caption" color="text.secondary">
                Refreshed {lastUpdated.toLocaleTimeString()}
              </Typography>
            )}
          </Box>

        </Toolbar>

      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && (
          <>
            <EnvironmentFilter
              environments={environments}
              selected={selectedEnv}
              onChange={setSelectedEnv}
            />

            <Grid container spacing={2}>
              {visible.map((service) => (
                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={service.id}>
                  <ServiceCard service={service} />
                </Grid>
              ))}
            </Grid>

            {visible.length === 0 && (
              <Typography color="text.secondary" textAlign="center" mt={8}>
                No services found.
              </Typography>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}
