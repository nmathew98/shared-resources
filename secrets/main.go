package main

import (
	"context"
	"os"
	"skulpture/secrets/commands"
	"skulpture/secrets/kryptos"

	"github.com/docopt/docopt-go"
	"github.com/dogmatiq/ferrite"
	_ "github.com/mattn/go-sqlite3"
)

func init() {
	ferrite.Init()

	ctx := context.WithValue(context.Background(), kryptos.ContextKeyDebug, false)

	db, close := kryptos.Open(ctx)
	defer close()

	kryptos.GetEnvs(ctx, db)

	for key, value := range kryptos.ENVS {
		os.Setenv(key, value)
	}
}

func main() {
	usage := `Kryptos

Usage:
    kryptos set <key> <value> [-d | --debug] [-g | --global]
	kryptos rm <key> [-d | --debug] [-a | --all] [-g | --global]
    kryptos grep <key>
    kryptos rotate (-e <encryption> | --encryption-key=<encryption>) [-d | --debug]
    kryptos cat
    kryptos dump [-o <output> | --output=<output>]
    kryptos prune <offset> [-d | --debug] [-a | --all] [-g | --global]
    kryptos info
    kryptos -h | --help
    kryptos -v | --version

Description:
    Manages environment variables
    Environment variables are encrypted and versioned

    Supported database drivers: sqlite3, postgres

Command reference:
    set     Set an environment variable
    rm      Remove an environment variable
    grep    Get the value of an environment variable
    rotate  Change the encryption key used
    cat     List all environment variables
    dump    Print all environment variables to a file
    prune   Delete all environment variables linked to a project
    info    Kryptos information

Options:
    -o --output=<output>              Output file [default: ./.env]
    -e --encryption-key=<encryption>  Encryption key
    -d --debug                        Enable debug logs [default: false]
    -a --all                          Include current variables
	-g --global                       Include global variables [default: false]
    -h --help                         Show this screen
    -v --version                      Show version

"Try to understand the fuckin' message I encrypted"`

	options, err := docopt.ParseArgs(usage, nil, kryptos.VERSION)
	if err != nil {
		panic(err)
	}

	debug, _ := options.Bool("--debug")
	ctx := context.WithValue(context.Background(), kryptos.ContextKeyDebug, debug)

	db, close := kryptos.Open(ctx)
	defer close()

	kryptos.GetEnvs(ctx, db)

	set, _ := options.Bool("set")
	rm, _ := options.Bool("rm")
	grep, _ := options.Bool("grep")
	rotate, _ := options.Bool("rotate")
	cat, _ := options.Bool("cat")
	dump, _ := options.Bool("dump")
	prune, _ := options.Bool("prune")
	info, _ := options.Bool("info")

	if set {
		key, _ := options.String("<key>")
		value, _ := options.String("<value>")
		isGlobal, _ := options.Bool("--global")

		setEnvCommand := commands.SetEnv{
			Db:       db,
			Key:      key,
			Value:    value,
			IsGlobal: isGlobal,
		}

		setEnvCommand.Execute(ctx)
	} else if rm {
		key, _ := options.String("<key>")
		includeDeprecated, _ := options.Bool("--all")
		includeGlobal, _ := options.Bool("--global")

		rmCommand := commands.Rm{
			Db:                db,
			Key:               key,
			IncludeDeprecated: includeDeprecated,
			IncludeGlobal:     includeGlobal,
		}

		rmCommand.Execute(ctx)
	} else if grep {
		key, _ := options.String("<key>")

		grepCommand := commands.Grep{
			Key:  key,
			View: os.Stdout,
		}

		grepCommand.Execute(ctx)
	} else if rotate {
		encryptionKey, _ := options.String("--encryption-key")

		rotateCommand := commands.Rotate{
			Db:            db,
			EncryptionKey: encryptionKey,
		}

		rotateCommand.Execute(ctx)
	} else if cat {
		catCommand := commands.Cat{
			View: os.Stdout,
		}

		catCommand.Execute(ctx)
	} else if dump {
		path, _ := options.String("--output")

		file, err := os.Create(path)
		if err != nil {
			panic(err)
		}
		defer file.Close()

		dumpCommand := commands.Dump{
			File: file,
		}

		dumpCommand.Execute(ctx)
	} else if prune {
		offset, _ := options.Int("<offset>")
		includeCurrent, _ := options.Bool("--all")
		pruneGlobal, _ := options.Bool("--global")

		pruneCommand := commands.Prune{
			Db:             db,
			Offset:         offset,
			IncludeCurrent: includeCurrent,
			PruneGlobal:    pruneGlobal,
		}

		pruneCommand.Execute(ctx)
	} else if info {
		infoCommand := commands.Info{
			View: os.Stdout,
		}

		infoCommand.Execute(ctx)
	}
}
