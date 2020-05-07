const styx = require("styx.js");
const data = styx.init("data/storage.json");
const fs = require("fs");

function store(id, winners, message, title, role, length, channel) {
  console.log("storing");
  var Giveaways = JSON.parse(data.get());

  if (id == undefined) {
    return false;
  }
  Giveaways.push({
    id: id,
    role: role,
    winners: winners,
    message: message,
    title: title,
    entered: [],
    ends: length + Date.now(),
    ended: false,
    channel: channel.id,
    time: length
  });
  data.save(JSON.stringify(Giveaways));
}

function react(id, uid) {
  var Giveaways = JSON.parse(data.get());

  if (Giveaways.find(x => x.id === id) !== undefined) {
    Giveaways.find(x => x.id === id).entered.push(uid);
    data.save(JSON.stringify(Giveaways));
  }
}

function remove(id, uid) {
  var Giveaways = JSON.parse(data.get());

  if (Giveaways.find(x => x.id === id) !== undefined) {
    Giveaways.find(x => x.id === id).entered.remove(uid);
    data.save(JSON.stringify(Giveaways));
  }
}

function role(id) {
  var Giveaways = JSON.parse(data.get());
  if (Giveaways.find(x => x.id === id) == undefined) {
    return 500;
  } else if (Giveaways.find(x => x.id === id).ended == true) {
    return 500;
  } else {
    if (Giveaways.find(x => x.id === id).role == "none") {
      return 600;
    } else {
      return Giveaways.find(x => x.id === id).role;
    }
  }
}

const save = (Array.prototype.save = function(data) {
  fs.writeFileSync(this[0], data, function(err) {
    if (err) throw err;
    return data;
  });
});

Array.prototype.remove = function() {
  var what,
    a = arguments,
    L = a.length,
    ax;
  while (L && this.length) {
    what = a[--L];
    while ((ax = this.indexOf(what)) !== -1) {
      this.splice(ax, 1);
    }
  }
  return this;
};

module.exports = {
  store,
  react,
  role,
  remove
};
