const models = require('../../db/models/index');

const Work = models.work;


const workCreator = (req) => {
  const { assignmentId } = req.body;
  const zipFile = req.files[0].path;
  return {
    assignmentId,
    zipFile,
  };
};

// api/work
// ~post new work and join on joins table
const postWork = (req, res) => {
  const { userId } = req.body;
  const newWork = workCreator(req);
  Work.create(newWork)
  .then(work => work.addUser(userId))
  .then(() => {
    res.sendStatus(200);
  })
  .catch((err) => {
    res.sendStatus(500).send(err);
  });
};

// api/work/byAssignmentId/:assignmentId
// ~post new work and join on joins table
const getWorkByAssignmentId = (req, res) => {
  const { assignmentId } = req.params;
  Work.findAll({
    where: {
      assignmentId,
    },
    include: [{
      model: models.user,
      attributes: ['firstName', 'lastName'],
      through: {
        attributes: [],
      },
    }],
  })
  .then((works) => {
    res.send(works);
  })
  .catch(err => res.sendStatus(500).send(err));
};

module.exports = {
  postWork,
  getWorkByAssignmentId,
};
