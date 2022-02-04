import React, { useEffect, useState } from 'react';
import { Box } from '@material-ui/core';
import { BadgeAvatar, ChatContent } from '../Sidebar';
import { makeStyles } from '@material-ui/core/styles';
import { setActiveChat } from '../../store/activeConversation';
import { readMessages, mutualConvoId } from '../../store/utils/thunkCreators';
import { connect } from 'react-redux';

const useStyles = makeStyles((theme) => ({
  root: {
    borderRadius: 8,
    height: 80,
    boxShadow: '0 2px 10px 0 rgba(88,133,196,0.05)',
    marginBottom: 10,
    display: 'flex',
    alignItems: 'center',
    '&:hover': {
      cursor: 'grab',
    },
  },
}));

const Chat = (props) => {
  const [unreadMessages, setUnreadMessages] = useState(0);
  const classes = useStyles();
  const { conversation } = props;
  const { otherUser, messages } = conversation;

  const unread = messages.filter(
    (cur) => cur.senderId === otherUser.id && cur.readMessage === false
  );

  const handleClick = async (conversation) => {
    await props.setActiveChat(conversation.otherUser.username);
    if (
      unread.length &&
      conversation.id &&
      unread?.at(-1).senderId === otherUser.id
    ) {
      await props.readMessages(conversation.id);
      setUnreadMessages(0);
      unread.length = 0;
    }
    await props.mutualConvoId(conversation.id);
  };

  useEffect(() => {
    setUnreadMessages(unread.length);
    // eslint-disable-next-line
  }, [conversation]);

  useEffect(() => {
    async function liveRead() {
      if (conversation.hasOwnProperty('mutualConv')) {
        if (conversation.mutualConv.length === 2) {
          await props.readMessages(conversation.id);
        }
      }
    }
    liveRead();
    // eslint-disable-next-line
  }, [conversation]);

  return (
    <Box onClick={() => handleClick(conversation)} className={classes.root}>
      <BadgeAvatar
        photoUrl={otherUser.photoUrl}
        username={otherUser.username}
        online={otherUser.online}
        sidebar={true}
      />
      <ChatContent
        unreadMessageCount={unreadMessages}
        conversation={conversation}
      />
    </Box>
  );
};

const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setActiveChat: (id) => {
      dispatch(setActiveChat(id));
    },
    readMessages: (id) => {
      dispatch(readMessages(id));
    },
    mutualConvoId: (id) => {
      dispatch(mutualConvoId(id));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Chat);
