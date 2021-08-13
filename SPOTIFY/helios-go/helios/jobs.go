package helios

type JobsService struct {
	client *Client
}

func (s *JobsService) List() (*map[string]Job, error) {
	req, err := s.client.NewRequest("GET", "/jobs")
	if err != nil {
		return nil, err
	}

	jobs := &map[string]Job{}
	if s.client.Do(req, jobs) != nil {
		return nil, err
	}

	return jobs, nil
}
