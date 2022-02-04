const router = require('express').Router();
const { User, Conversation, Message } = require('../../db/models');
const { Op } = require('sequelize');
const onlineUsers = require('../../onlineUsers');
const db = require('../../db/db');

// get all conversations for a user, include latest message text for preview, and all messages
// include other user model so we have info on username/profile pic (don't include current user info)
router.get('/', async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }

    const {
      user: { id: userId },
    } = req;

    await User.update(
      { convoid: 0 },
      {
        where: {
          id: userId,
        },
      }
    );

    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: {
          user1Id: userId,
          user2Id: userId,
        },
      },
      attributes: ['id'],
      order: [[Message, 'createdAt', 'ASC']],
      include: [
        { model: Message, order: ['createdAt', 'ASC'] },
        {
          model: User,
          as: 'user1',
          where: {
            id: {
              [Op.not]: userId,
            },
          },
          attributes: ['id', 'username', 'photoUrl'],
          required: false,
        },
        {
          model: User,
          as: 'user2',
          where: {
            id: {
              [Op.not]: userId,
            },
          },
          attributes: ['id', 'username', 'photoUrl'],
          required: false,
        },
      ],
    });

    for (let i = 0; i < conversations.length; i++) {
      const convo = conversations[i];
      const convoJSON = convo.toJSON();

      // set a property "otherUser" so that frontend will have easier access
      if (convoJSON.user1) {
        convoJSON.otherUser = convoJSON.user1;
        delete convoJSON.user1;
      } else if (convoJSON.user2) {
        convoJSON.otherUser = convoJSON.user2;
        delete convoJSON.user2;
      }

      // set property for online status of the other user
      if (onlineUsers.includes(convoJSON.otherUser.id)) {
        convoJSON.otherUser.online = true;
      } else {
        convoJSON.otherUser.online = false;
      }

      const { messages } = convoJSON;
      convoJSON.latestMessageText = messages[messages.length - 1].text;
      conversations[i] = convoJSON;
    }

    res.json(conversations);
  } catch (error) {
    next(error);
  }
});

router.put('/:convoId', async (req, res, next) => {
  try {
    const { user } = req;
    const { convoId } = req.params;

    if (!user) return res.sendStatus(401);

    const getConvo = await Conversation.findOne({
      where: {
        id: convoId,
      },
      include: [{ model: Message, order: ['createdAt', 'ASC'] }],
    });

    const unreadMessageId = getConvo
      .toJSON()
      .messages.filter((cur) => cur.readMessage === false)
      .map((cur) => cur.id);

    await Message.update(
      { readMessage: true },
      {
        where: {
          conversationId: convoId,
          id: [...unreadMessageId],
          readMessage: false,
        },
      }
    );

    const newConvo = await Conversation.findConvoById(convoId, user.id);
    const newConvoJSON = newConvo.toJSON();

    const { user1, user2, messages } = newConvoJSON;

    if (user1) {
      newConvoJSON.otherUser = user1;
      delete user1;
    } else if (user2) {
      newConvoJSON.otherUser = user2;
      delete user2;
    }

    if (onlineUsers.includes(newConvoJSON.otherUser.id)) {
      newConvoJSON.otherUser.online = true;
    } else {
      newConvoJSON.otherUser.online = false;
    }

    newConvoJSON.latestMessageText = messages[messages.length - 1].text;
    res.status(200).json({ conversation: newConvoJSON });
  } catch (error) {
    next(error);
  }
});

router.put('/convo-for-user/:convoId', async (req, res, next) => {
  try {
    const { user } = req;
    const { convoId } = req.params;

    if (!user) return res.sendStatus(401);

    await User.update(
      { convoid: convoId },
      {
        where: {
          id: user.id,
        },
      }
    );

    const getMutualConvo = await User.findAll({
      where: {
        convoid: convoId,
      },
    });

    for (let i = 0; i < getMutualConvo.length; i++) {
      const userConvoId = getMutualConvo[i].toJSON();
      getMutualConvo[i] = userConvoId;
    }

    res.status(200).json({ mutualConvo: getMutualConvo });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
