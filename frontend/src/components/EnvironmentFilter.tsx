import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

interface Props {
  environments: string[];
  selected: string | null;
  onChange: (env: string | null) => void;
}

export function EnvironmentFilter({ environments, selected, onChange }: Props) {
  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
      <Button
        variant={selected === null ? 'contained' : 'outlined'}
        size="small"
        onClick={() => onChange(null)}
        disableElevation
      >
        All
      </Button>

      {environments.map((env) => (
        <Button
          key={env}
          variant={selected === env ? 'contained' : 'outlined'}
          size="small"
          onClick={() => onChange(env)}
          disableElevation
          sx={{ textTransform: 'capitalize' }}
        >
          {env}
        </Button>
      ))}
      
    </Box>
  );
}