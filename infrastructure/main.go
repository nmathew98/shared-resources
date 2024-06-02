package main

import (
	"github.com/dogmatiq/ferrite"
	"github.com/pulumi/pulumi-digitalocean/sdk/v4/go/digitalocean"
	"github.com/pulumi/pulumi-gcp/sdk/v7/go/gcp/compute"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

var (
	GOOGLE_PROJECT = ferrite.
			String("GOOGLE_PROJECT", "GCP Project").
			Required()
	DIGITALOCEAN_TOKEN = ferrite.
				String("DIGITALOCEAN_TOKEN", "DigitalOcean token").
				Required()
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		sharedResourcesNetwork, err := compute.NewNetwork(ctx, "shared-resources-network", &compute.NetworkArgs{
			Name:        pulumi.String("shared-resources-network"),
			Description: pulumi.String("Allows Cloudflare sources only"),
		})
		if err != nil {
			return err
		}

		ctx.Export("sharedResourceNetwork", sharedResourcesNetwork.Name)

		_, err = compute.NewFirewall(ctx, "allow-cloudflare", &compute.FirewallArgs{
			Name:        pulumi.String("allow-cloudflare"),
			Network:     sharedResourcesNetwork.Name,
			Description: pulumi.StringPtr("Allow all traffic from Cloudflare"),
			Allows: compute.FirewallAllowArray{
				&compute.FirewallAllowArgs{
					Protocol: pulumi.String("icmp"),
				},
				&compute.FirewallAllowArgs{
					Protocol: pulumi.String("tcp"),
					Ports: pulumi.StringArray{
						pulumi.String("0-65535"),
					},
				},
			},
			SourceRanges: pulumi.ToStringArray([]string{
				"173.245.48.0/20",
				"103.21.244.0/22",
				"103.22.200.0/22",
				"103.31.4.0/22",
				"141.101.64.0/18",
				"108.162.192.0/18",
				"190.93.240.0/20",
				"188.114.96.0/20",
				"197.234.240.0/22",
				"198.41.128.0/17",
				"162.158.0.0/15",
				"104.16.0.0/13",
				"104.24.0.0/14",
				"172.64.0.0/13",
				"131.0.72.0/22",
			},
			),
			TargetTags: pulumi.StringArray{
				pulumi.String("allow-cloudflare"),
			},
		})
		if err != nil {
			return err
		}

		_, err = compute.NewFirewall(ctx, "allow-ssh", &compute.FirewallArgs{
			Name:        pulumi.String("allow-ssh"),
			Network:     sharedResourcesNetwork.Name,
			Description: pulumi.StringPtr("Allow SSH"),
			Allows: compute.FirewallAllowArray{
				&compute.FirewallAllowArgs{
					Protocol: pulumi.String("tcp"),
					Ports: pulumi.StringArray{
						pulumi.String("22"),
					},
				},
			},
			SourceRanges: pulumi.ToStringArray([]string{
				"0.0.0.0/0",
			},
			),
			TargetTags: pulumi.StringArray{
				pulumi.String("allow-ssh"),
			},
		})
		if err != nil {
			return err
		}

		cluster, err := digitalocean.NewDatabaseCluster(ctx, "shared-postgres", &digitalocean.DatabaseClusterArgs{
			Name:      pulumi.String("shared-postgres"),
			Engine:    pulumi.String("pg"),
			Version:   pulumi.String("16"),
			Size:      pulumi.String(digitalocean.DatabaseSlug_DB_1VPCU1GB),
			Region:    pulumi.String(digitalocean.RegionSYD1),
			NodeCount: pulumi.Int(1),
		})
		if err != nil {
			return err
		}

		_, err = digitalocean.NewDatabaseDb(ctx, "shared-postgres-1", &digitalocean.DatabaseDbArgs{
			ClusterId: cluster.ID(),
			Name:      pulumi.String("shared-postgres-1"),
		})
		if err != nil {
			return err
		}

		return nil
	})
}
