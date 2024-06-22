package commands_test

import (
	"bufio"
	"context"
	"fmt"
	"os"
	"skulpture/secrets/commands"
	"skulpture/secrets/kryptos"
	"strings"
	"testing"
)

func TestDumpMixed(t *testing.T) {
	ctx := context.WithValue(context.Background(), kryptos.ContextKeyDebug, false)

	for dbName, init := range DBs {
		stop := init(t)
		defer stop()

		db, close := kryptos.Open(ctx)
		defer close()

		envs := map[string]string{
			"ABC": "GHI",
			"DEF": "JKL",
		}

		i := 0
		for key, value := range envs {
			setCommand := commands.SetEnv{
				Db:       db,
				Key:      key,
				Value:    value,
				IsGlobal: i%2 == 0,
			}

			setCommand.Execute(ctx)

			i++
		}

		tmp, err := os.CreateTemp("./", "secrets-dump")
		if err != nil {
			t.Fatal(err)
		}
		defer tmp.Close()
		defer os.Remove(tmp.Name())

		dumpCommand := commands.Dump{
			File: tmp,
		}

		dumpCommand.Execute(ctx)

		tmp.Seek(0, 0)
		s := bufio.NewScanner(tmp)
		result := ""
		for s.Scan() {
			result += fmt.Sprintf("%s\n", s.Text())
		}

		for key, value := range envs {
			expect := fmt.Sprintf("%s=%s\n", key, value)

			if !strings.Contains(result, expect) {
				t.Errorf("db: %s, expected '%s' to contain '%s'", dbName, result, expect)
			}
		}
	}
}
