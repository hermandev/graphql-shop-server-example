const bcrypt = require("bcryptjs");
const Event = require("../../models/event");
const User = require("../../models/user");

const event = eventId => {
  return Event.find({ _id: { $in: eventId } })
    .then(events => {
      return events.map(event => {
        return {
          ...event._doc,
          _id: event.id,
          creator: user.bind(this, event.creator)
        };
      });
    })
    .catch(err => {
      throw err;
    });
};

const user = userId => {
  return User.findById(userId)
    .then(user => {
      return {
        ...user._doc,
        _id: user.id,
        password: null,
        createEvents: event.bind(this, user._doc.createEvents)
      };
    })
    .catch(err => {
      throw err;
    });
};

module.exports = {
  events: () => {
    return Event.find()
      .then(events => {
        return events.map(event => {
          return {
            ...event._doc,
            _id: event.id,
            creator: user.bind(this, event._doc.creator)
          };
        });
      })
      .catch(err => {
        throw err;
      });
  },

  createEvent: args => {
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: "5cc560e0609e57074c1e31c4"
    });
    let createdEvent;
    return event
      .save()
      .then(result => {
        createdEvent = {
          ...result._doc,
          _id: result._doc._id.toString(),
          creator: user.bind(this, result._doc.creator)
        };
        return User.findById("5cc560e0609e57074c1e31c4");
      })
      .then(user => {
        if (!user) {
          throw new Error("User tidak di temukan");
        }
        user.createEvents.push(event);
        return user.save();
      })
      .then(result => {
        console.log(result);
        return createdEvent;
      })
      .catch(err => {
        console.log(err);
      });
  },
  createUser: args => {
    return User.findOne({ email: args.userInput.email })
      .then(user => {
        if (user) {
          throw new Error("User sudah terdaftar!!!");
        }
        return bcrypt.hash(args.userInput.password, 12);
      })
      .then(hashPassword => {
        const user = new User({
          email: args.userInput.email,
          password: hashPassword
        });
        return user.save();
      })
      .then(result => {
        return { ...result._doc, password: null, _id: result.id };
      })
      .catch(err => {
        throw err;
      });
  }
};
