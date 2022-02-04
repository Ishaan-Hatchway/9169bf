import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'space-between',
    marginLeft: 20,
    flexGrow: 1,
  },
  username: {
    fontWeight: 'bold',
    letterSpacing: -0.2,
  },
  previewText: {
    fontSize: 12,
    color: '#9CADC8',
    letterSpacing: -0.17,
  },
  unreadText: {
    color: 'black',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: -0.17,
  },
  unreadBubble: {
    backgroundColor: '#4267B2',
    color: 'white',
    borderRadius: '50%',
    marginRight: '10px',
    marginTop: '4px',
    width: '20px',
    paddingLeft: '5px',
  },
}));

const ChatContent = (props) => {
  const classes = useStyles();

  const { conversation, unreadMessageCount } = props;
  const { latestMessageText, otherUser } = conversation;

  return (
    <Box className={classes.root}>
      <Box>
        <Typography className={classes.username}>
          {otherUser.username}
        </Typography>
        <Typography
          className={
            unreadMessageCount > 0 ? classes.unreadText : classes.previewText
          }
        >
          {latestMessageText}
        </Typography>
      </Box>
      {unreadMessageCount > 0 && (
        <Box>
          <div className={classes.unreadBubble}>{unreadMessageCount}</div>
        </Box>
      )}
    </Box>
  );
};

export default ChatContent;
