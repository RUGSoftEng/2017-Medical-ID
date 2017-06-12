var config = {}

config.service = 'Gmail';
config.username = 'medicalid17@gmail.com';
config.password = 'enterpasswordhere';

config.db = 'mongodb://root:toor@med-shard-00-00-mgwxu.mongodb.net:27017,med-shard-00-01-mgwxu.mongodb.net:27017,med-shard-00-02-mgwxu.mongodb.net:27017/loginapp?ssl=true&replicaSet=med-shard-0&authSource=admin';

config.encryptDbSecret = 'PutTheDbEncryptionKeyH3r3';

module.exports = config;
