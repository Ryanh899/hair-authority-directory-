// aws s3 form policy 
const policy = {
    expiration: "2020-12-01T12:00:00.000Z",
    conditions: [
      { bucket: "ha-images-02" },
      ["starts-with", "$key", "uploads/2020/"],
      { acl: "public-read" },
      ["starts-with", "$Content-Type", "image/"],
      { "x-amz-meta-uuid": "e15e27ad-0fed-4af0-8c20-f3d0884fe225" },
      ["starts-with", "$x-amz-meta-tag", ""]
    ]
  };

const Aws = {
    signForm (policy) {
        const policies = {}; 
        policies.policy_base64 = Buffer.from(JSON.stringify(policy)).toString("base64"); 
        policies.signedPolicy = Buffer.from(JSON.stringify(policies.policy_base64)).toString("base64"); 

        return policies
    }

}

module.exports = Aws; 


