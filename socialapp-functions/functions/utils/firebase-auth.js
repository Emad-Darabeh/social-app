const { admin, usersRef } = require('./admin');
module.exports = (req, res, next) => {
  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    idToken = req.headers.authorization.split('Bearer ')[1];
  } else {
    console.error('No token found');
    return res.status(403).json({ error: 'Unauthorized' });
  }

  admin
    .auth()
    .verifyIdToken(idToken)
    .then(decodedIdToken => {
      req.user = decodedIdToken;
      return usersRef
        .where('userId', '==', req.user.uid)
        .limit(1)
        .get();
    })
    .then(snapshot => {
      req.user.handle = snapshot.docs[0].data().handle;
      req.user.imageUrl = snapshot.docs[0].data().imageUrl;
      return next();
    })
    .catch(err => {
      console.error('Error while verifying token: ', err);
      return res.status(403).json(err);
    });
};