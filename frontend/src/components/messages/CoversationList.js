import { List, ListItem, Avatar, Badge, Typography, Box } from '@mui/material';
import { Circle, Group, Person } from '@mui/icons-material';

const ConversationList = ({ conversations, selected, onSelect }) => (
  <List>
    {conversations.map(conv => (
      <ListItem 
        button 
        key={conv.id} 
        selected={selected?.id === conv.id}
        onClick={() => onSelect(conv)}
        sx={{ px: 2, py: 1.5 }}
      >
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={conv.unread && (
            <Circle sx={{ color: 'primary.main', fontSize: 12 }} />
          )}
        >
          <Avatar sx={{ bgcolor: 'grey.100' }}>
            {conv.isGroup ? (
              <Group sx={{ color: 'text.secondary' }} />
            ) : (
              <Person sx={{ color: 'text.secondary' }} />
            )}
          </Avatar>
        </Badge>
        
        <Box sx={{ ml: 2, overflow: 'hidden' }}>
          <Typography variant="subtitle1" noWrap>
            {conv.name}
          </Typography>
          <Typography variant="body2" noWrap color="text.secondary">
            {conv.lastMessage}
          </Typography>
        </Box>
        
        {conv.timestamp && (
          <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
            {conv.timestamp}
          </Typography>
        )}
      </ListItem>
    ))}
  </List>
);

export default ConversationList;