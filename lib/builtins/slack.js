'use strict';

exports.load = (bot, datastore) => {
  let api = {};

  let formatChannelId = (id) => {
    if (id.startsWith('D')) {
      return `<@${bot.self.id}>`;
    }
    return `<#${id}>`;
  };
  let formatUserID = id => `<@${id}>`;

  let prettifyMemberList = (memberList) => {
    return memberList && memberList.map(formatUserID)
      .join(' ');
  }

  let prettifyChannelList = (channelList) => {
    return channelList && channelList.map(formatChannelId)
      .join(' ');
  }

  let isUserActive = (user) => !datastore.getUserById(user).deleted;
  let isUserHuman = (user) => !datastore.getUserById(user).is_bot;
  let isUserOnline = (user) => datastore.getUserById(user).presence === 'active';

  let getChannel = (chanArg) => {
    let tryIdMatch = chanArg.match(/\<#(\w+)|.*>/);
    return tryIdMatch ? datastore.getChannelById(tryIdMatch[1]) :
      datastore.getChannelByName(chanArg) ||
      datastore.getChannelById(chanArg);
  }

  let listChannelMembers = (chanArg) => {
    let memberList;

    if (chanArg) {
      let channel = getChannel(chanArg);

      if (!channel) {
        throw new Error(`#${chanArg}? Never heard of that!`);
        return;
      }

      if (!channel.is_member) {
        throw new Error(`doge me into <#${channel.id}>`);
        return;
      }

      memberList = channel.members;
    } else {
      memberList = Object.keys(datastore.users);
    }

    return memberList;
  }

  api.channels = (cb, args) => {
    cb(null, prettifyChannelList(Object.keys(datastore.channels)));
  };

  // TODO: refactor for code reuse

  api.everyone = (cb, args) => {
    try {
      cb(null, prettifyMemberList(listChannelMembers(args[0])));
    }
    catch (e) {
      cb(e);
    }
  };

  api.members = (cb, args) => {
    try {
      cb(null, prettifyMemberList(listChannelMembers(args[0])
        .filter(isUserActive)));
    }
    catch (e) {
      cb(e);
    }
  };

  api.humans = (cb, args) => {
    try {
      cb(null, prettifyMemberList(listChannelMembers(args[0])
        .filter(isUserActive)
        .filter(isUserHuman)));
    }
    catch (e) {
      cb(e);
    }
  }

  api.online = (cb, args) => {
    try {
      cb(null, prettifyMemberList(listChannelMembers(args[0])
        .filter(isUserActive)
        .filter(isUserHuman)
        .filter(isUserOnline)));
    }
    catch (e) {
      cb(e);
    }
  }

  api.channel = (cb, args) => {
    try {
      let message = args.props.message;
      cb(null, formatChannelId(message.channel.id));
    }
    catch (e) {
      cb(e);
    }
  }

  api.user = (cb, args) => {
    try {
      let message = args.props.message;
      cb(null, formatUserID(message.sender.id));
    }
    catch (e) {
      cb(e);
    }
  }

  return api;
};
