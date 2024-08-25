package main

import (
	"bufio"
	"context"
	"fmt"
	"io"
	"os"
	"os/exec"

	"github.com/creack/pty"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

const HistorySize = 16

type Terminal struct {
	ctx    context.Context
	shells []*os.File
}

func NewTerminal() *Terminal {
	return &Terminal{
		shells: []*os.File{},
	}
}

func (t *Terminal) startup(ctx context.Context) {
	t.ctx = ctx
}

func (t *Terminal) shutdown() {
	for _, shell := range t.shells {
		shell.Close()
	}
}

func (t *Terminal) StartShell() (string, error) {
	shellPath := os.Getenv("SHELL")
	cmd := exec.Command(shellPath)
	shell, err := pty.StartWithSize(cmd, &pty.Winsize{Rows: 10, Cols: 80})
	if err != nil {
		runtime.LogError(t.ctx, "Unable to start shell")
		return "", err
	}
	t.shells = append(t.shells, shell)
	id := fmt.Sprint(cmd.Process.Pid)

	buffer := [][]rune{}
	reader := bufio.NewReader(shell)
	readChan := make(chan bool)

	// read from shell and store in buffer
	go func() {
		line := []rune{}
		buffer = append(buffer, line)
		for {
			r, _, err := reader.ReadRune()
			if err != nil {
				if err != io.EOF {
					runtime.LogError(t.ctx, "Unable to read rune")
				}
				return
			}

			line = append(line, r)
			buffer[len(buffer)-1] = line
			if r == '\n' {
				if len(buffer) > HistorySize {
					buffer = buffer[1:]
				}
				line = []rune{}
				buffer = append(buffer, line)
			}

			readChan <- true
		}
	}()

	// send shell output as string to frontend
	go func() {
		for {
			<-readChan
			text := ""
			for _, line := range buffer {
				text += string(line)
			}
			runtime.EventsEmit(t.ctx, id, text)
		}
	}()

	return id, nil
}
