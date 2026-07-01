/**
 * Run multiple statements atomically (node:sqlite has no .transaction helper).
 */
function runTransaction(db, fn) {
  db.exec('BEGIN IMMEDIATE');
  try {
    fn();
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

module.exports = runTransaction;
