const {ObjectId} = require('mongodb') 
// const activities = ['Create', ]
const {ASContext} = require('./consts')

function validateObject (object) {
    if (object && object.id) {
        object['@context'] = object['@context'] || ASContext
        return true
    }
}

function validateActivity (object) {
    if (object && object.id && object.actor) {
        return true
    }
}

module.exports.activity = function activity (req, res, next) {
    // TODO real validation
    if (!validateActivity(req.body)) {
        return res.status(400).send('Invalid activity')
    }
    next()
}

module.exports.outboxActivity = function outboxActivity (req, res, next) {
    if (!validateActivity(req.body)) {
        if (!validateObject(req.body)) {
            return res.status(400).send('Invalid activity')
        }
        const newID = ObjectId()
        req.body = {
            _id: newID,
            '@context': ASContext,
            type: 'Create',
            id: `http://${req.app.get('domain')}/o/${newID.toHexString()}`,
            actor: req.body.attributedTo,
            object: req.body,
            published: new Date().toISOString(),
            to: req.body.to,
            cc: req.body.cc,
            bcc: req.body.cc,
            audience: req.body.audience,
        }
    }
    next()
}