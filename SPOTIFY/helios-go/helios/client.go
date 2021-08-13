package helios

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net"
	"net/http"
	"net/url"
)

const (
	srvService  = "helios"
	srvProtocol = "http"
)

type Client struct {
	// HTTP client used to talk to Helios.
	client *http.Client

	BaseURL *url.URL

	Hosts *HostsService
	Jobs  *JobsService
}

// NewClient returns a new Helios client for talking to (one of) the
// Helios masters in the provided domain. The Helios masters are discovered
// via SRV lookup. Optionally you may also provide your own http.Client.
func NewClient(domain string, httpClient *http.Client) (*Client, error) {
	_, addrs, err := net.LookupSRV(srvService, srvProtocol, domain)
	if err != nil {
		return nil, err
	}

	masterURL, err := url.Parse(fmt.Sprintf("http://%v:%d/", addrs[0].Target, addrs[0].Port))
	if err != nil {
		return nil, err
	}

	return NewClientForURL(masterURL, httpClient), nil
}

// NewClientForURL returns a new Helios client for talking to a Helios master at
// an explicitly specified URL. Optionall you may also provide your own http.Client.
// This method is useful when you don't have SRV records setup, or when you want to
// talk to a specific Helios master in a cluster.
func NewClientForURL(masterURL *url.URL, httpClient *http.Client) *Client {
	if httpClient == nil {
		httpClient = http.DefaultClient
	}

	c := &Client{client: httpClient, BaseURL: masterURL}

	c.Hosts = &HostsService{client: c}
	c.Jobs = &JobsService{client: c}

	return c
}

func (c *Client) NewRequest(method, path string) (*http.Request, error) {
	p, err := url.Parse(path)
	if err != nil {
		return nil, err
	}

	u := c.BaseURL.ResolveReference(p)

	req, err := http.NewRequest(method, u.String(), nil)
	if err != nil {
		return nil, err
	}

	return req, nil
}

func (c *Client) Do(req *http.Request, v interface{}) error {
	res, err := c.client.Do(req)
	if err != nil {
		return err
	}

	defer res.Body.Close()

	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return err
	}

	if v != nil {
		return json.Unmarshal(body, v)
	}

	return nil
}

func (c *Client) Version() (string, error) {
	req, err := c.NewRequest("GET", "/version")

	var version string
	if c.Do(req, &version) != nil {
		return "", err
	}

	return version, nil
}

func (c *Client) Masters() ([]string, error) {
	req, err := c.NewRequest("GET", "/masters")

	var masters []string
	if c.Do(req, &masters) != nil {
		return nil, err
	}

	return masters, nil
}
