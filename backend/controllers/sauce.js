const Sauce = require('../models/sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    const sauce = new Sauce({
        ...sauceObject,
       userId: req.auth.userId,
       imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save()
        .then(() => res.status(201).json(sauce))
        .catch(error => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  
    delete sauceObject._userId;
    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(403).json({ message : 'Not authorized'});
            } else {
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
        .then(() => res.status(200).json(sauce))
        .catch(error => res.status(400).json({ error }));
        }  })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id})
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({message: 'Not authorized'});
            } else {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({_id: req.params.id})
                        .then(() => { res.status(204).json({})})
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch( error => {
            res.status(500).json({ error });
        });
 };

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
}

exports.getAllSauces =  (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
}


exports.likeSauce = (req, res, next) => {
    const sauceLike = req.body;
    Sauce.findOne({ _id: req.params.id })
      .then(sauce => {
        const userId = req.auth.userId;
        const { like } = sauceLike;
        const indexLiked = sauce.usersLiked.indexOf(userId);
        const indexDisliked = sauce.usersDisliked.indexOf(userId);
  
        if (like == 1) {
          if (indexLiked === -1) {
            sauce.likes++;
            sauce.usersLiked.push(userId);
          } 
        } else if (like === -1) {
          
          if (indexDisliked === -1) {
            sauce.dislikes++;
            sauce.usersDisliked.push(userId);
          }
        } else {
          if (indexLiked !== -1) {
            sauce.likes--;
            sauce.usersLiked.splice(indexLiked, 1);
          }
          if (indexDisliked !== -1) {
            sauce.dislikes--;
            sauce.usersDisliked.splice(indexDisliked, 1);
          }
        }
        sauce
          .save()
          .then(() => res.status(200).json(sauce))
          .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(404).json({ error }));
  };