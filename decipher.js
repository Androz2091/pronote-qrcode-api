const forge = require('node-forge');

module.exports.getBuffer = (chain) => new forge.util.ByteBuffer(forge.util.encodeUtf8(chain));

module.exports.decipherLogin = (chain, key, iv, tokenCode) => {

    try {
        const createdKey = forge.md.md5.create().update(key.bytes()).digest();
        const createdIV = iv.length() ? forge.md.md5.create().update(iv.bytes()).digest() : new forge.util.ByteBuffer('\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0');
        const createdChain = new forge.util.ByteBuffer(forge.util.hexToBytes(chain));
        const createdCipher = forge.cipher.createDecipher('AES-CBC', createdKey);
        createdCipher.start({
            iv: createdIV
        });
        createdCipher.update(createdChain);
        return createdCipher.finish() && createdCipher.output.bytes();
    } catch (e) {
        return false;
    }

};
