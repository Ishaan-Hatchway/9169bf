import React, { useEffect, useState } from 'react';
import { Box } from '@material-ui/core';
import { SenderBubble, OtherUserBubble } from '../ActiveChat';
import moment from 'moment';
import { readMessages } from '../../store/utils/thunkCreators';
import { connect } from 'react-redux';

const Messages = (props) => {
  const [readMarker, setReadMarker] = useState(false);
  const { messages, otherUser, userId, convo } = props;

  useEffect(() => {
    messages.forEach((cur, _, arr) => {
      if (cur.id === arr.at(-1).id && cur.readMessage === true) {
        return setReadMarker(true);
      } else if (cur.id === arr.at(-1).id && arr.at(-1).readMessage === false) {
        setReadMarker(false);
      }
    });

    async function exceptionalRead() {
      if (
        messages.length &&
        messages.at(-1).senderId === otherUser.id &&
        messages.at(-1).readMessage === false
      ) {
        if (messages.at(-1).senderId === userId) console.log('ch');
        await props.readMessages(convo.id);
      }
    }
    exceptionalRead();
    // eslint-disable-next-line
  }, [messages.length, messages]);

  return (
    <Box>
      {messages.map((message, _, arr) => {
        const time = moment(message.createdAt).format('h:mm');
        return message.senderId === userId ? (
          <SenderBubble
            key={message.id}
            text={message.text}
            otherUser={otherUser}
            time={time}
            marker={message.id === arr.at(-1).id && readMarker}
          />
        ) : (
          <OtherUserBubble
            key={message.id}
            text={message.text}
            time={time}
            otherUser={otherUser}
          />
        );
      })}
    </Box>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    readMessages: (id) => {
      dispatch(readMessages(id));
    },
  };
};

export default connect(null, mapDispatchToProps)(Messages);
