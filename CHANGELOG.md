### 4.0.0
* Use AWS XHRClient in browser. [#42][42]

### 3.1.2
* Fix unicode issue. [#43][43]

### 3.1.1
* Fix DELETEs with request body e.g. `clearScroll()`. [#19][19] [#41][41]
* Reduce dependency footprint. [#40][40]

### 3.1.0
* Allow aws config to be set per instance. [#37][37]
* Add config for setting httpOptions on aws-sdk's requests. [#8][8]

### 3.0.0
* Support down to node 4.x.

### 2.0.5
* Catch aws credential errors. [#35][35]
* Add source maps.

### 2.0.0
* Load credentials from environment.

### 1.1.0

* Added `credentials` option for passing in an AWS `Credentials` object.

[43]: https://github.com/TheDeveloper/http-aws-es/issues/43
[41]: https://github.com/TheDeveloper/http-aws-es/pull/41
[19]: https://github.com/TheDeveloper/http-aws-es/issues/19
[40]: https://github.com/TheDeveloper/http-aws-es/pull/40
[37]: https://github.com/TheDeveloper/http-aws-es/issues/37
[8]: https://github.com/TheDeveloper/http-aws-es/pull/8
[35]: https://github.com/TheDeveloper/http-aws-es/issues/35
