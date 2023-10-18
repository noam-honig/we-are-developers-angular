import { Component, OnDestroy, OnInit } from '@angular/core'
import { Task } from '../../shared/task'
import { remult } from 'remult'
import { fromLiveQuery } from '../utils'
import { TasksController } from '../../shared/tasksController'

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
})
export class TodoComponent {
  taskRepo = remult.repo(Task)

  tasks$ = fromLiveQuery(
    this.taskRepo.liveQuery({
      orderBy: {
        createdAt: 'asc',
      },
      where: {
        completed: undefined,
      },
    })
  )

  newTaskTitle = ''
  async addTask() {
    try {
      const newTask = await this.taskRepo.insert({
        title: this.newTaskTitle,
      })

      this.newTaskTitle = ''
    } catch (error: any) {
      alert(error.message)
    }
  }
  async save(task: Task) {
    await this.taskRepo.save(task)
  }

  async deleteTask(task: Task) {
    try {
      await this.taskRepo.delete(task)
    } catch (error: any) {
      alert(error.message)
    }
  }

  async setAllCompleted(completed: boolean) {
    TasksController.setAllCompleted(completed)
  }
}
