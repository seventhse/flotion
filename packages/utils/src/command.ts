"use client"

import { isMacOs } from "./client"

export interface CommandItem {
  name: string // 唯一标识
  label?: string
  execute: () => void // 执行逻辑
  crtl?: boolean
  shortcut?: string // 快捷键, e.g. 'Ctrl+K','Shift+A' 'G G'
  description?: string // 命令描述
  inPaletteShow?: boolean
}

export class CommandManager {
  private commands = new Map<string, CommandItem>()

  private keyBuffer: string[] = []
  private keyBufferTimeout: ReturnType<typeof setTimeout> | null = null
  private readonly KEY_BUFFER_RESET_TIME = 1000 // 1 second
  private isMac = isMacOs()

  private shortcutMap = new Map<string, string>() // shortcut -> command name

  private resetKeyBuffer() {
    this.keyBuffer = []
    if (this.keyBufferTimeout) {
      clearTimeout(this.keyBufferTimeout)
    }
    this.keyBufferTimeout = null
  }

  private addCommand(command: CommandItem) {
    this.commands.set(command.name, command)
  }

  private removeCommand(name: string) {
    this.commands.delete(name)
  }

  register(command: CommandItem) {
    if (this.commands.has(command.name)) {
      console.error(`Command with name "${command.name}" already exists`)
      return
    }

    if (command.shortcut && this.shortcutMap.has(command.shortcut)) {
      console.error(`Command with shortcut "${command.shortcut}" already exists`)
      return
    }

    this.addCommand({
      crtl: true,
      inPaletteShow: true,
      ...command
    })

    if (command.shortcut) {
      this.shortcutMap.set(command.shortcut, command.name)
    }
  }

  unregister(name: string) {
    const command = this.commands.get(name)
    if (command?.shortcut) {
      this.shortcutMap.delete(command.shortcut)
    }
    this.removeCommand(name)
  }

  execute(name: string) {
    const command = this.commands.get(name)
    command?.execute()
  }

  keyboardCallback(e: KeyboardEvent) {
    const target = e.target as HTMLElement
    if (["INPUT", "TEXTAREA"].includes(target.tagName) || target.isContentEditable) {
      return
    }

    this.keyBuffer.push(e.key.toUpperCase())

    if (this.keyBufferTimeout) {
      clearTimeout(this.keyBufferTimeout)
    }

    this.keyBufferTimeout = setTimeout(() => {
      this.resetKeyBuffer()
    }, this.KEY_BUFFER_RESET_TIME)

    for (const [shortcut, commandName] of this.shortcutMap) {
      const command = this.commands.get(commandName)
      if (!command) continue

      const shortcuts = shortcut.split("+").map((k) => k.trim().toUpperCase())
      const isCtrlMatch = !command.crtl || (command.crtl && (this.isMac ? e.metaKey : e.ctrlKey))

      if (this.keyBuffer.length < shortcuts.length) continue

      const bufferSlice = this.keyBuffer.slice(-shortcuts.length)
      if (isCtrlMatch && shortcuts.every((s, i) => s === bufferSlice[i])) {
        e.preventDefault()
        command.execute()
        this.resetKeyBuffer()
        break
      }
    }
  }

  getCommands(): CommandItem[] {
    return Array.from(this.commands.values())
  }

  getPaletteCommands(): CommandItem[] {
    return this.getCommands().filter((item) => item.inPaletteShow)
  }

  clear() {
    this.commands?.clear?.()
    this.shortcutMap?.clear?.()
  }
}
