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
	homePath := os.Getenv("HOME")
	cmd := exec.Command(shellPath)
	cmd.Dir = homePath
	shell, err := pty.StartWithSize(cmd, &pty.Winsize{Rows: 10, Cols: 80})
	if err != nil {
		runtime.LogError(t.ctx, "Unable to start shell")
		return "", err
	}
	t.shells = append(t.shells, shell)
	id := fmt.Sprint(cmd.Process.Pid)

	reader := bufio.NewReader(shell)

	go func() {
		for {
			r, _, err := reader.ReadRune()
			if err != nil {
				if err != io.EOF {
					runtime.LogError(t.ctx, "Unable to read rune")
				}
				return
			}

			runtime.EventsEmit(t.ctx, id, string(r))
		}
	}()

	runtime.EventsOn(t.ctx, id+"/write", func(optionalData ...any) {
		switch data := optionalData[0].(type) {
		case string:
			shell.WriteString(data)
		default:
			runtime.LogError(t.ctx, "Data to write is not a string")
		}
	})

	runtime.EventsOn(t.ctx, id+"/resize", func(optionalData ...any) {
		cols, ok := optionalData[0].(float64)
		if !ok {
			runtime.LogError(t.ctx, "Cols is not a float64")
		}
		rows, ok := optionalData[1].(float64)
		if !ok {
			runtime.LogError(t.ctx, "Rows is not an float64")
		}

		pty.Setsize(shell, &pty.Winsize{Cols: uint16(cols), Rows: uint16(rows)})
	})

	return id, nil
}
