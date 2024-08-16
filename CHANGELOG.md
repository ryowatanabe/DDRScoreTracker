# Changelog

## [0.3.0] - 2024-08-17

### Added

- Support for DDR World
  - Retrieve data from DDR World website
  - Filter charts by flare rank
  - Sort charts by flare skill
  - Show distribution graph of flare rank

## [0.2.0] - 2023-01-08

### Added

 - Supported (misdelivered) music data removal by using isDeleted flag

### Changed

 - Migrated Vue.js 2 to 3

### Fixed

 - Single play data could not be successfully submitted to Skill Attack

## [0.1.0] - 2022-11-05

### Changed

 - Applied to Manifest V3
 - Data retrieval from DDR A20+ website is now optional (hidden by default)

## [0.0.16] - 2022-06-18

### Added

 - Support for A3 grades

## [0.0.15] - 2022-05-21

### Fixed

 - Ignore "music not found" error when retrieving data (workaround for A20+ / A3 site compatibility)

## [0.0.14] - 2022-04-04

### Added

 - Support data acquisition from DDR A3 website (DDR A20+ website is still supported)

## [0.0.13] - 2020-09-27

### Added

 - Handle deleted musics

### Fixed

 - Filter setting dialogue and functional menu dialogue are now scrollable when their contents overflow

## [0.0.12] - 2020-09-12

### Changed

 - Fetch music list file corresponding to current schema version

## [0.0.11] - 2020-09-12

### Added

 - Version (compatibility) check for music list

### Changed

 - Not close tabs after error occured

## [0.0.10] - 2020-08-23

### Changed

 - Show score data / score updates for musics which is not in music list

## [0.0.9] - 2020-08-01

### Added

 - Show score updates after retrieving score data

### Fixed

 - Now data retrieval actions can be correctly aborted. (In some cases, background script could not return to idle state after aborting)

## [0.0.8] - 2020-07-16

### Added

 - Automatically check for music list updates

### Changed

 - Unified "Retrieve score data" buttons into one

### Fixed

 - Updated e-amusement login error detection corresponding to A20 PLUS site changes

## [0.0.7] - 2020-07-04

### Added

 - Support for A20 PLUS grades
 - Saved filters feature

## [0.0.6] - 2020-06-21

### Added

 - Support for [Skill Attack](http://skillattack.com/sa4/)

## [0.0.5] - 2020-06-11

### Added

 - Score statistics feature

## [0.0.4] - 2020-05-05

### Changed

 - Improved log output so that you can see progress when retrieving data

## [0.0.3] - 2020-04-26

### Added

 - Fully translated into English

## 0.0.2 - 2020-04-19

First release

[0.3.0]:https://github.com/ryowatanabe/DDRScoreTracker/compare/v0.2.0...v0.3.0
[0.2.0]:https://github.com/ryowatanabe/DDRScoreTracker/compare/v0.1.0...v0.2.0
[0.1.0]:https://github.com/ryowatanabe/DDRScoreTracker/compare/v0.0.16...v0.1.0
[0.0.16]:https://github.com/ryowatanabe/DDRScoreTracker/compare/v0.0.15...v0.0.16
[0.0.15]:https://github.com/ryowatanabe/DDRScoreTracker/compare/v0.0.14...v0.0.15
[0.0.14]:https://github.com/ryowatanabe/DDRScoreTracker/compare/v0.0.13...v0.0.14
[0.0.13]:https://github.com/ryowatanabe/DDRScoreTracker/compare/v0.0.12...v0.0.13
[0.0.12]:https://github.com/ryowatanabe/DDRScoreTracker/compare/v0.0.11...v0.0.12
[0.0.11]:https://github.com/ryowatanabe/DDRScoreTracker/compare/v0.0.10...v0.0.11
[0.0.10]:https://github.com/ryowatanabe/DDRScoreTracker/compare/v0.0.9...v0.0.10
[0.0.9]:https://github.com/ryowatanabe/DDRScoreTracker/compare/v0.0.8...v0.0.9
[0.0.8]:https://github.com/ryowatanabe/DDRScoreTracker/compare/v0.0.7...v0.0.8
[0.0.7]:https://github.com/ryowatanabe/DDRScoreTracker/compare/v0.0.6...v0.0.7
[0.0.6]:https://github.com/ryowatanabe/DDRScoreTracker/compare/v0.0.5...v0.0.6
[0.0.5]:https://github.com/ryowatanabe/DDRScoreTracker/compare/v0.0.4...v0.0.5
[0.0.4]:https://github.com/ryowatanabe/DDRScoreTracker/compare/v0.0.3...v0.0.4
[0.0.3]:https://github.com/ryowatanabe/DDRScoreTracker/compare/v0.0.2...v0.0.3
