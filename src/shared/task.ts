import { Allow, Entity, Fields } from 'remult'

@Entity('tasks', {
  allowApiCrud: Allow.authenticated,
  allowApiDelete: false,
  allowApiInsert: 'admin',
})
export class Task {
  @Fields.cuid()
  id = ''
  @Fields.string<Task>({
    validate: (task) => {
      if (task.title.length < 3) throw new Error('Too short')
    },
  })
  title = ''
  @Fields.boolean()
  completed = false
  @Fields.createdAt()
  createdAt?: Date
}
