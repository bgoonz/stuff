package helios

import (
	"fmt"
)

type HostsService struct {
	client *Client
}

func (s *HostsService) List() ([]string, error) {
	req, err := s.client.NewRequest("GET", "/hosts")
	if err != nil {
		return nil, err
	}

	hosts := &[]string{}
	if s.client.Do(req, hosts) != nil {
		return nil, err
	}

	return *hosts, nil
}

func (s *HostsService) Status(host string) (*HostStatus, error) {
	req, err := s.client.NewRequest("GET", fmt.Sprintf("/hosts/%s/status", host))
	if err != nil {
		return nil, err
	}

	hs := &HostStatus{}
	if s.client.Do(req, hs) != nil {
		return nil, err
	}

	return hs, nil
}
