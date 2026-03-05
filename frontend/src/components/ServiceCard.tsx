import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { ServiceStatus } from '../types';

const INDICATOR_COLOR: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  none: 'success',
  minor: 'warning',
  major: 'warning',
  critical: 'error',
};

interface Props {
  service: ServiceStatus;
}

export function ServiceCard({ service }: Props) {
  const check = service.latest_check;
  const isUp = check?.is_up ?? false;

  return (
    <Card
      variant="outlined"
      sx={{ borderLeft: 4, borderLeftColor: isUp ? 'success.main' : 'error.main' }}
    >
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

          {/* Stats row */}
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
            <Accordion disableGutters elevation={0} sx={{ mt: 1.5, border: '1px solid', borderColor: 'warning.main', borderRadius: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="caption" color="warning.dark" fontWeight={600}>
                  ⚠ Version drift detected
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="caption" display="block">
                  Expected: <code>{service.expected_version}</code>
                </Typography>
                <Typography variant="caption" display="block">
                  Got: <code>{check.actual_version}</code>
                </Typography>
              </AccordionDetails>
            </Accordion>
          )}

          {check?.is_legacy && (
            <Chip
              label="Legacy server"
              size="small"
              variant="outlined"
              color="default"
              sx={{ mt: 1.5 }}
            />
          )}

          {/* Footer */}
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 1.5 }}>
            
            <Chip label={service.environment} size="small" variant="outlined" />

            {check && (
              <Typography variant="caption" color="text.disabled">
                Last checked {new Date(check.checked_at + 'Z').toLocaleTimeString()}
              </Typography>
            )}
            
          </Stack>

        </CardContent>
    </Card>
  );
}