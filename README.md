# stevenschobert.com

My flat-file blog, written in PHP and Markdown.

## Adding Posts

Create a `.md` file with the following bit JSON at the top, and save it in the `posts` directory:

	{
		"title": "Post Title",
		"date": "08-20-12",
		"tags": ["github"]
	}
	--

Simple and fast. One of the main perks of having a flat-file blog.

## Configuration

Near the top of the `index.php` file, you will find some global settings you can adjust:

	$blog = new Slim(array(
		'view'			=> new TwigView(),
		'posts.path'	=> './posts',
		'md'			=> new dflydev\markdown\MarkdownParser(),
		'pagination'	=> 5
	));

- `posts.path`: The relative path to the directory that holds your Markdown posts
- `pagination`: The number of posts that are show per-page

__Note:__ the `view` and `md` are required and not customizable.

## Theming

The `templates` directory has several template files to help you style your blog:

- `main.html`: The core html template. All of the other templates extend this one. Contains all js/css links, headers & footers, etc.
- `index.html`: The home page template. Right now shows your blog index.
- `post.html`: The post view page, shows a single post.
- `404.html`: Custom 404 template.
- `about.html`: An about me page
- `tagged.html`: The tag search template.
- `pagination.html`: The pagination template (partial) that shows on the bottom of the blog index.

So adding your own styles is as easy as changing the `<link>` tag in the `main.html` template to point to your file:

	<link rel="stylesheet" href="/css/main.css" />

If you are unfamiliar with the template syntax, check out the [Twig documentation](http://twig.sensiolabs.org/documentation).

## Advanced Customization

The whole blog engine is built on top of the [Slim Framework](http://www.slimframework.com/) and is easily customizable. For advanced customization, consult the [docs](http://www.slimframework.com/documentation/stable).