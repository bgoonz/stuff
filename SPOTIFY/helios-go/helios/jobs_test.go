package helios

import (
	"fmt"
	"net/http"
	"testing"
)

func TestJobsService_List(t *testing.T) {
	setup()
	defer teardown()

	testMux.HandleFunc("/jobs", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "GET" {
			fmt.Fprint(w, `{
				"foo-job:v1.2.3:faa7ee4834afaf4502ea83c284e7a37a9fa63930" : {
				  "env" : {},
				  "registration" : {
					 "foo/http" : {
						"ports" : {
						   "http" : {}
						}
					 },
					 "foo/https" : {
						"ports" : {
						   "https" : {}
						}
					 }
				  },
				  "image" : "registry:80/spotify/foo:123",
				  "gracePeriod" : null,
				  "ports" : {
					 "http" : {
						"protocol" : "tcp",
						"internalPort" : 8080,
						"externalPort" : 8060
					 },
					 "https" : {
						"protocol" : "tcp",
						"internalPort" : 4229,
						"externalPort" : 5700
					 }
				  },
				  "volumes" : {},
				  "id" : "foo-job:1:faa7ee4834afaf4502ea83c284e7a37a9fa63930",
				  "registrationDomain" : "",
				  "expires" : null,
				  "command" : [
					 "python",
					 "foo.py",
					 "/etc/foo.conf"
				  ]
				},
				"bar-job:v4.5.6:d1976330dc95c11f6b5e6eb8e1882bad9369db36" : {
				  "env" : {
					  "SOME_VAR" : "some value"
				  },
				  "registration" : {
					 "bar/http" : {
						"ports" : {
						   "http" : {}
						}
					 }
				  },
				  "image" : "registry:80/spotify/bar:456",
				  "gracePeriod" : null,
				  "ports" : {
					 "http" : {
						"protocol" : "tcp",
						"internalPort" : 8080,
						"externalPort" : 8080
					 }
				  },
				  "volumes" : {
					 "/etc/bar/secret-keys.yaml:ro" : "/etc/bar/secret-keys.yaml"
				  },
				  "id" : "bar-job:v4.5.6:d1976330dc95c11f6b5e6eb8e1882bad9369db36",
				  "registrationDomain" : "",
				  "expires" : null,
				  "command" : [
					 "java",
					 "-jar",
					 "/bar.jar"
				  ]
				}
			}`)
		}
	})

	l, err := client.Jobs.List()
	jobs := *l

	if err != nil {
		t.Errorf("Jobs.List returned error: %v", err)
	}

	if actual, expected := len(jobs), 2; actual != expected {
		t.Fatalf("Jobs.List returned %d jobs, expected %d", actual, expected)
	}

	fooJob, fooPresent := jobs["foo-job:v1.2.3:faa7ee4834afaf4502ea83c284e7a37a9fa63930"]
	barJob, barPresent := jobs["bar-job:v4.5.6:d1976330dc95c11f6b5e6eb8e1882bad9369db36"]

	if !fooPresent || !barPresent {
		t.Fatalf("Jobs.List didn't return an expected job")
	}

	if actual, expected := fooJob.Image, "registry:80/spotify/foo:123"; actual != expected {
		t.Fatalf("Jobs.List returned job with image %v, expected %v", actual, expected)
	}
	if actual, expected := barJob.Image, "registry:80/spotify/bar:456"; actual != expected {
		t.Fatalf("Jobs.List returned job with image %v, expected %v", actual, expected)
	}
}
