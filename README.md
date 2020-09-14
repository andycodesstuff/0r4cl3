# 0r4cl3
## Getting started
### Docker installation _(TODO)_
### Manual installation
Clone the repository and install the required dependencies (for both NodeJS and Python)
```
$ npm install
$ pip install -r requirements.txt
```

### Run
- In order to authenticate users, `0r4cl3` requires the environment variable `ACCESS_TOKEN` to be set
- In order to capture network traffic, `0r4cl3` requires the environment variable `SNIFFER_INTERFACE` to be set
- `0r4cl3` requires root privileges to sniff network traffic
- Once everything has been started, `0r4cl3` should be accessible on port `5000`

#### Production environment _(TODO)_
#### Development environment
```
# ACCESS_TOKEN="<ACCESS TOKEN>" SNIFFER_INTERFACE="<INTERFACE>" npm run dev
```
