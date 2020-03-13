const knex = require("../config/knex/knex");
const _ = require("lodash");
const Auth = require("../../auth_resources");
const jwt = require("jsonwebtoken");
const Listings = require("./listings");

const User = {
  async findEmail(userInfo) {
    // determines if email exists in either client or business table
    let user = await knex("users")
      .select()
      .where("email", userInfo)
      .then(response => {
        return response;
      })
      .catch(err => console.log(err));
    console.log(user);
    if (user && user.length !== 0) {
      console.log("client_user");
      user = user[0];
      user.isClientUser = true;
      return user;
    } else {
      let professional_user = await knex("professional_users")
        .select()
        .where("email", userInfo);
      if (professional_user && professional_user.length !== 0) {
        console.log("professional_user");
        professional_user = professional_user[0];
        professional_user.isProfessionalUser = true;
        return professional_user;
      } else {
        let admin_user = await knex("admin_users")
          .select()
          .where("email", userInfo);
        if (admin_user && admin_user.length !== 0) {
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
  async findId(userInfo) {
    // determines if email exists in either client or business table
    let user = await knex("users")
      .select()
      .where("id", userInfo)
      .then(response => {
        return response;
      })
      .catch(err => console.log(err));
    console.log(user);
    if (user && user.length !== 0) {
      console.log("client_user");
      user = user[0];
      user.isClientUser = true;
      return user;
    } else {
      let professional_user = await knex("professional_users")
        .select()
        .where("id", userInfo);
      if (professional_user && professional_user.length !== 0) {
        console.log("professional_user");
        professional_user = professional_user[0];
        professional_user.isProfessionalUser = true;
        return professional_user;
      } else {
        let admin_user = await knex("admin_users")
          .select()
          .where("id", userInfo);
        if (admin_user && admin_user.length !== 0) {
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
    let insert = new Promise((resolve, reject) => {
      knex("professional_users")
        .insert({
          id: user.id,
          email: user.email,
          hash: user.hash,
          salt: user.salt,
          phone: user.phone,
          first_name: user.first_name,
          last_name: user.last_name
        })
        .then(resp => {
          console.log(resp);
          resolve(
            knex("saved_listings")
              .select()
              .where("user_id", user.id)
              .then(response => {
                response.forEach(listing => {
                  Listings.deleteSavedListing(listing.listing_id, user.id)
                    .then(resp => {
                      console.log(
                        "delete listing: ",
                        listing.listing_id,
                        user.id
                      );
                      Listings.saveListing_professional(
                        listing.listing_id,
                        user.id
                      )
                    })
                    .catch(err => {
                      console.log(err);
                    });
                });
              })
              .catch(err => console.log(err))
          );
        })
        .catch(err => {
          console.log(err);
        });
    });
    insert
      .then(response => {
        knex("users")
          .delete()
          .where("id", user.id)
          .then(resp => {
            console.log(user.id);
            console.log("----_DELETE_______");
            console.log(resp);
            if (cb) {
              cb.status(200).send("user moved from client to professional");
            } else {
              return resp
            }
          })
          .catch(err => {
            console.log(err);
          });
      })
      .catch(err => {
        console.log(err);
        if (cb) {
        cb.status(401).json(err);
        } else {
          return
        }
      });
  },
  getProfessionalProfile(user, cb) {
    return knex("professional_users")
      .select()
      .where("id", user.id)
      .catch(err => console.log(err));
  },
  getProfessionalInfo(id) {
    return knex("professional_info")
      .select()
      .where("professional_id", id)
      .catch(err => console.log(err));
  },
  updateProfessionalInfo(userInfo, cb) {
    console.log(userInfo);
    return knex("professional_users")
      .where("id", userInfo.id)
      .update(userInfo)
      .then(response => {
        cb.status(200).json(response);
      })
      .catch(err => {
        console.log(err);
      });
  },
  async professionalToAdmin(user, cb) {
    let insert = new Promise((resolve, reject) => {
      knex("admin_users")
        .insert({
          id: user.id,
          email: user.email,
          hash: user.hash,
          salt: user.salt,
          phone: user.phone,
          first_name: user.first_name,
          last_name: user.last_name
        })
        .then(resp => {
          console.log(resp);
          resolve(
            knex("saved_professional_listings")
              .select()
              .where("professional_user_id", user.id)
              .then(response => {
                response.forEach(listing => {
                  Listings.deleteSavedListing_professional(
                    listing.listing_id,
                    user.id
                  )
                    .then(resp => {
                      console.log(listing);
                      Listings.saveListing_admin(
                        listing.listing_id,
                        user.id
                      );
                    })
                    .catch(err => {
                      console.log(err);
                    });
                });
              })
              .catch(err => console.log(err))
          );
        })
        .catch(err => {
          console.log(err);
        });
    });
    insert
      .then(response => {
        knex("professional_users")
          .delete()
          .where("id", user.id)
          .then(resp => {
            console.log(user.id);
            console.log("----_DELETE_______");
            console.log(resp);
            cb.status(200).send("user moved from professional to admin");
          })
          .catch(err => {
            console.log(err);
          });
      })
      .catch(err => {
        console.log(err);
        cb.status(401).json(err);
      });
  },
  getUserInfo__client (id) {
    knex('users')
      .select()
      .where('id', id)
      .then(response => {
        return response
      })
      .catch(err => {
        console.log(err); 
      })
      
  }
};

module.exports = User;
