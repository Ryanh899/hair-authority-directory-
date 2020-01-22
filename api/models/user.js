const knex = require("../config/knex/knex");
const _ = require("lodash");
const Auth = require("../../auth_resources");
const jwt = require("jsonwebtoken");

const User = {
  async findEmail(userInfo) {
    // determines if email exists in either client or business table
    let user = await knex("users")
      .select()
      .where("email", userInfo)
      .then(response => {
        return response; 
      }).catch(err => console.log(err)); 
    console.log(user)
    if (user.length !== 0) {
      console.log("client_user");
      user = user[0];
      user.isClientUser = true;
      return user;
    } else {
      let professional_user = await knex("professional_users")
        .select()
        .where("email", userInfo);
      if (professional_user.length !== 0) {
        console.log("professional_user");
        professional_user = professional_user[0];
        professional_user.isProfessionalUser = true;
        return professional_user;
      } else {
        let admin_user = await knex("admin_users")
          .select()
          .where("email", userInfo);
        if (admin_user.length !== 0) {
          console.log("admin_user");
          admin_user = admin_user[0];
          admin_user.isAdminUser = true;
          return admin_user;
        } else {
          return []; 
        }
      }
    }
  },
  async userToProfessional(user, cb) {
    // const token = userInfo.authorization.split(" ")[1];
    // const decodedInfo = jwt.decode(token);
    // console.log(decodedInfo);
    // const user = await this.findEmail(decodedInfo.email);
    knex("professional_users")
      .insert({
        id: user.id,
        email: user.email,
        hash: user.hash,
        salt: user.salt
      })
      .then(resp => {
        console.log(resp);
      })
      .catch(err => {
        console.log(err);
      });
    knex("users")
      .delete()
      .where("email", user.email)
      .then(resp => {
        console.log(resp);
        cb.status(200).send('user moved from client to professional')
      })
      .catch(err => {
        console.log(err);
      });
  }
};

module.exports = User;
