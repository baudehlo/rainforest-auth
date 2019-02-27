var expect = require('chai').expect;
const auth = require('../');

const key = 'key';

describe('rainforest-auth', () => {
  let rfAuth;
  beforeEach(() => {
    rfAuth = new auth(key);
  });

  it('remembers the key', () => {
    expect(rfAuth.key).to.be.equal(key);
  });

  describe('get_run_callback', () => {
    let url, urlSplit;
    const runId = '123456';

    beforeEach(() => {
      rfAuth = new auth(key);
      url = rfAuth.get_run_callback(runId, 'before_run');
      console.log(url);
      urlSplit = url.split('/');
    });

    it('returns a url', () => {
      expect(url.startsWith('https')).to.be.true;
    });

    it('has the correct run_id', () => {
      expect(urlSplit[7]).to.be.equal(runId);
    });

    it('has the correct action', () => {
      expect(urlSplit[8]).to.be.equal('before_run');
    });

    it('has the correct digest', () => {
      const digest = urlSplit[9];
      console.log('digest', digest);
      const verified = rfAuth.verify(digest, 'before_run', { run_id: runId });
      expect(verified).to.be.true;
    });
  });

  describe('sign', () => {
    it('returns the expected signature', () => {
      expect(rfAuth.sign('test', { option: 1 })).to.be.equal('65f2253344287b3c5634a1ce6163fb694b2280b1');
    });

    it('changes the signature with different data', () => {
      expect(rfAuth.sign('test', { option: 2 })).to.not.be.equal('65f2253344287b3c5634a1ce6163fb694b2280b1');
    });

    it('works with no options parameter', () => {
      expect(rfAuth.sign('test')).to.equal('d38f897889c808c021a8ed97d2caacdac48b8259');
    });

    describe('key hash is null', () => {
      it('raises an exception', () => {
        try {
          new auth(null).sign('test')
        } catch (e) {
          expect(e).to.be.an('error');
        }
      });
    });
  });

  describe('sign_old', () => {
    it('returns the expected signature', () => {
      expect(rfAuth.sign_old('test', { option: 1 })).to.be.equal('5957ba2707a51852d32309d16184e8adce9c4d8e');
    });

    it('changes the signature with different data', () => {
      expect(rfAuth.sign_old('test', { option: 2 })).to.not.be.equal('5957ba2707a51852d32309d16184e8adce9c4d8e');
    });

    it('works with no options parameter', () => {
      expect(rfAuth.sign_old('test')).to.equal('0a41bdf26fac08a89573a7f5efe0a5145f2730df');
    });

    describe('key hash is null', () => {
      it('raises an exception', () => {
        try {
          new auth(null).sign_old('test')
        } catch (e) {
          expect(e).to.be.an('error');
        }
      });
    });
  });

  describe('verify', () => {
    const old_digest = '5957ba2707a51852d32309d16184e8adce9c4d8e';
    const digest = '65f2253344287b3c5634a1ce6163fb694b2280b1';

    it('returns true for a valid signature', () => {
      expect(rfAuth.verify(digest, 'test', { option: 1 })).to.be.true;
    });

    it('returns true for a valid old signature', () => {
      expect(rfAuth.verify(old_digest, 'test', { option: 1 })).to.be.true;
    });

    it('returns false for a bad signature', () => {
      expect(rfAuth.verify(digest, 'test', { option: 2 })).to.be.false;
    });

    it('returns false for a bad old signature', () => {
      expect(rfAuth.verify(old_digest, 'test', { option: 2 })).to.be.false;
    });

    it('works with no options parameter', () => {
      // OLD
      expect(rfAuth.verify('0a41bdf26fac08a89573a7f5efe0a5145f2730df', 'test')).to.be.true;
      // NEW
      expect(rfAuth.verify('d38f897889c808c021a8ed97d2caacdac48b8259', 'test')).to.be.true;
    });
  });
});
