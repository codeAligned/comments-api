import makeRemoveComment from './remove-comment'
import makeCommentsDb from '../db/comments-db'
import makeFakeComment from '../../../__test__/fixtures/comment'
import makeDb, { closeDb, clearDb } from '../../../__test__/fixtures/db'
import makeComment from '../comment'

describe('remove comment', () => {
  let commentsDb
  beforeEach(() => {
    commentsDb = makeCommentsDb({ makeDb })
  })
  afterEach(async () => {
    await clearDb()
    return true
  })
  afterAll(async () => {
    await closeDb()
    return true
  })
  it('deletes a comment with no replies', async () => {
    const removeComment = makeRemoveComment({
      commentsDb,
      editComment: () => {
        throw new Error('editComment should not have been called!')
      }
    })

    const fakeComment = makeFakeComment()
    await commentsDb.insert(fakeComment)

    const found = await commentsDb.findById(fakeComment)
    expect(found).toEqual(fakeComment)

    await removeComment(fakeComment)
    const notFound = await commentsDb.findById(fakeComment)
    expect(notFound).toBe(null)
  })
  it('marks a comment with replies as "deleted"', async () => {
    const removeComment = makeRemoveComment({
      commentsDb
    })

    const fakeComment = makeFakeComment()
    await commentsDb.insert(fakeComment)

    const fakeCommentReply = makeFakeComment({
      replyToId: fakeComment.id
    })
    await commentsDb.insert(fakeCommentReply)
    await removeComment(fakeComment)
    const deleted = await commentsDb.findById(fakeComment)
    expect(makeComment(deleted).isDeleted()).toBe(true)
  })
})
