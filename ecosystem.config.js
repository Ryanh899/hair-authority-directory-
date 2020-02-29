module.exports = {
    apps: [{
      name: 'hair-authority-directory-',
      script: './server.js'
    }],
    deploy: {
      production: {
        user: 'ubuntu',
        host: 'ec2-34-201-189-88.compute-1.amazonaws.com',
        key: '~/Desktop/ha_ec2_cred.pem',
        ref: 'origin/master',
        repo: 'git@github.com:Ryanh899/hair-authority-directory-.git',
        path: '/home/ubuntu/',
        'post-deploy': 'npm install && pm2 startOrRestart ecosystem.config.js'
      }
    }
  }