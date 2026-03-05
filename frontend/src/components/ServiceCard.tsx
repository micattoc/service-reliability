import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type { ServiceStatus } from '../types';

const INDICATOR_COLOR: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  none: 'success',
  minor: 'warning',
  major: 'warning',
  critical: 'error',
};

interface Props {
  service: ServiceStatus;
  onSelect: (id: number) => void;
}

export function ServiceCard({ service, onSelect }: Props) {
  const check = service.latest_check;
  const isUp = check?.is_up ?? false;

  return (
    <Card
      variant="outlined"
      sx={{ borderLeft: 4, borderLeftColor: isUp ? 'success.main' : 'error.main' }}
    >
      <CardActionArea onClick={() => onSelect(service.id)}>

        <CardContent>

          {/* Header row */}
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" fontWeight={600} noWrap>
                {service.name}
              </Typography>
              <Tooltip title={service.url}>
                <Typography variant="caption" color="text.secondary" noWrap display="block">
                  {service.url}
                </Typography>
              </Tooltip>
            </Box>

            <Chip
              label={isUp ? '● UP' : '● DOWN'}
              color={isUp ? 'success' : 'error'}
              size="small"
              sx={{ fontWeight: 700, flexShrink: 0 }}
            />

          </Stack>

          <Divider sx={{ my: 1.5 }} />

          {/* Statistics row */}
          {check ? (
            <Stack direction="row" spacing={3}>
              <Box>
                <Typography variant="caption" color="text.secondary" textTransform="uppercase">
                  Latency
                </Typography>

                <Typography variant="body2" fontWeight={600}>
                  {check.latency_ms != null ? `${check.latency_ms.toFixed(0)} ms` : '—'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" textTransform="uppercase">
                  HTTP
                </Typography>

                <Typography
                  variant="body2"
                  fontWeight={600}
                  color={check.is_up ? 'success.main' : 'error.main'}
                >
                  {check.http_status ?? '—'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" textTransform="uppercase">
                  Indicator
                </Typography>

                <Box>
                  <Chip
                    label={check.indicator ?? '—'}
                    color={check.indicator ? INDICATOR_COLOR[check.indicator] ?? 'default' : 'default'}
                    size="small"
                  />
                </Box>
              </Box>

            </Stack>
          ) : (
            <Typography variant="body2" color="text.disabled">
              Awaiting first check…
            </Typography>
          )}

          {/* Version drift banner */}
          {check?.is_drifted && (
            <Box sx={{ mt: 1.5 }}>
              <Chip
                label={`⚠ Version drift — expected ${service.expected_version}, got ${check.actual_version}`}
                color="warning"
                size="small"
                variant="outlined"
              />
            </Box>
          )}

          {/* Footer */}
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 1.5 }}>
            
            <Chip label={service.environment} size="small" variant="outlined" />

            {check && (
              <Typography variant="caption" color="text.disabled">
                Last checked {new Date(check.checked_at).toLocaleTimeString()}
              </Typography>
            )}
          </Stack>

        </CardContent>

      </CardActionArea>
    </Card>
  );
}
