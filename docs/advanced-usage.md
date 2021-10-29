# Advanced Usage

This guide provides a real world application of _ImP_ with a possible
integration into a frontend development workflow or build cycle.

Assuming you have a website with some kind of responsive design that dynamically
adapts to different screen sizes and possibly even device types, you will have
to provide your image assets in different resolutions and possibly even in
different file formats, especially if you're supporting older browsers.

You _could_ launch your GFX tool of choice to create all these different
image files manually, but you don't have to. Because there is _ImP_.

## State your Requirements

Your (responsive) design needs its image files in three different sizes,
covering the range of users from fully blown retina displays to tiny smartphones.

Additionally, you want to provide the image's original resolution aswell, i.e.
to provide your users with the highest count of all details as possible.

You're considering speed of your page load, so you use a techique to only
serve your users the smallest file possible, while still covering their size
demands(
[see this guide on developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)).

Formally, you will want to convert your source image `a.jpg` into the following
output images:

- `a.png`: full-scale image, with better compression but widely supported
- `a-large.png`: high resolution, for desktop users, with better compression and widely supported
- `a-large.webp`: high resolution, for desktop users, with even better compression, supported in all up-to-date moder browsers
- `a-medium.png`: medium resolution, for modern smartphones, with better compression and widely supported
- `a-medium.webp`: medium resolution, for modern smartphones, with even better compression
- `a-small.png`: low resolution, for smartphones, with better compression and widely supported
- `a-small.webp`: low resolution, for smartphones, with even better compression

Your input files are _mostly_ camera pictures, so you want to keep their
aspect and simply scaling them down, relative to their width (to fit into your
layout).

## Combining Configuration File and Command Line Parameters

These requirements can be achieved easily using _ImP_:

The following `.imprc.json` will provide the matching target configuration
aswell as a format configuration for highly optimized images, meaning they are
as small as possible, sacrificing computation time to achieve better compression.

```JSON
{
  "targets": {
    "full": {
      "mode": "do-not-scale",
      "filenameSuffix": "",
      "formats": ["png"]
    },
    "small": {
      "mode": "keep-aspect",
      "filenameSuffix": "-small",
      "formats": ["png", "webp"],
      "width": 200
    },
    "medium": {
      "mode": "keep-aspect",
      "filenameSuffix": "-medium",
      "formats": ["png", "webp"],
      "width": 400
    },
    "large": {
      "mode": "keep-aspect",
      "filenameSuffix": "-large",
      "formats": ["png", "webp"],
      "width": 1000
    }
  },
  "formatOptions": {
    "png": {
      "progression": false,
      "compressionLevel": 9,
      "quality": 100,
      "force": true
    },
    "webp": {
      "quality": 100,
      "alphaQuality": 0,
      "lossless": true,
      "reductionEffort": 6,
      "force": true
    }
  }
}
```

Let's have a look at the actual call to _ImP_:

```bash
$ tree .
 |- build
    |- images
 |- src
    |- a.jpg
    |- b.png
 |- package.json
 |- .imprc.json

$ npx imp -i src/a.jpg -o build/images
$ tree .
 |- build
    |- images
       |- a.png
       |- a-large.png
       |- a-large.webp
       |- a-medium.png
       |- a-medium.webp
       |- a-small.png
       |- a-small.webp
 |- src
    |- a.jpg
    |- b.png
 |- package.json
 |- .imprc.json

$ npx imp -i src/b.png -o build/images
$ tree .
 |- build
    |- images
       |- a.png
       |- a-large.png
       |- a-large.webp
       |- a-medium.png
       |- a-medium.webp
       |- a-small.png
       |- a-small.webp
       |- b.png
       |- b-large.png
       |- b-large.webp
       |- b-medium.png
       |- b-medium.webp
       |- b-small.png
       |- b-small.webp
 |- src
    |- a.jpg
    |- b.png
 |- package.json
 |- .imprc.json
```

## Example Integration with `make`

_ImP_ can easily be integrated into an actual build workflow. In example, here
is how you could provide recipes for your `Makefile`:

```Makefile
SRC_FILES_IMAGES = $(shell find src -type f)
TARGET_FILES_IMAGES_PATH = $(patsubst src/%, build/images/%, $(SRC_FILES_IMAGES))
TARGET_FILES_IMAGES = $(addsuffix .png, $(basename $(TARGET_FILES_IMAGES_PATH)))

optimize-images : $(TARGET_FILES_IMAGES)
.PHONY : optimize-images

build/images/%.png : src/%.*
  npx imp -o build -i $<
```
