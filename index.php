<?php
/**
 * stevenschobert.com
 *
 * My blog, currently built on PHP, Twig, Slim, Compass/Sass, and Markdown.
 *
 * @author      Steven Schobert
 * @link        http://www.stevenschobert.com
 * @copyright   Copyright (c) 2012, Steven Schobert
 * @version     1.0.1
 */

// ---------------------- SETUP ------------------------
// bring in our autoloader, which sets up our namespaces
require_once 'vendor/autoload.php';

// create a new Slim instance, called $blog, and
// define some configuration options, like the
// relative path to our posts directory, also init
// a markdown processor and store it as 'md'
$blog = new Slim(array(
  'view'         => new TwigView(),
  'posts.path'   => './posts',
  'md'           => new dflydev\markdown\MarkdownParser(),
  'pagination'   => 5
));
// -----------------------------------------------------

// -------------------- HELPER FUNCTIONS ---------------
// this is a helper function that parses a directory for
// markdown files and returns an array of nicely sorted
// posts (by date), including their meta data and content
$getMarkdownPosts = function ($dir) {
  // start a directory iterator
  $files = new DirectoryIterator($dir);

  // create an array that will hold our posts
  $posts = array();

  // loop through our DirectoryIterator
  foreach($files as $post) {
    // only process .md file extensions
    if($post->getExtension() === 'md') {
      // get the post file's data
      $post_data = file_get_contents($post->getPathname());

      // parse the file for its meta data
      $post_data = explode('--', $post_data);

      // move the meta data into its array, and decode the json data
      $post_meta_json = array_shift($post_data);
      $post_meta = json_decode($post_meta_json, true);

      // parse the markdown portion into HTML
      $md = new dflydev\markdown\MarkdownParser();
      $post_html = $md->transformMarkdown($post_data[0]);

      // save each post to our array, and store
      // the post details as a new hash
      $posts[strtotime($post_meta['date'])] = array(
        'title'     => $post_meta['title'],
        'desc'      => $post_meta['desc'],
        'date'      => $post_meta['date'],
        'tags'      => $post_meta['tags'],
        'link'      => $post->getBasename('.md'),
        'html'      => $post_html
      );
    }
  }

  // sort our posts (inversely) by created date (the key value)
  krsort($posts);

  // return our posts
  return $posts;
};
// ----------------------------------------------------------

// ------------------------ ROUTES --------------------------
// home page
$blog->get('/', function () use ($blog, $getMarkdownPosts) {
  // get our posts
  $posts = $getMarkdownPosts($blog->config('posts.path'));

  // limit our posts to pagination
  $posts_limit = array_slice($posts, 0, $blog->config('pagination'));

  // get the total number of posts
  $posts_count = count($posts);

  // calculate the number of page
  $pages_number = ceil($posts_count / $blog->config('pagination'));

  // render the main page
  $blog->render('index.html', array(
    'posts'        => $posts_limit,
    'page_current' => 1,
    'page_count'   => $pages_number
  ));
});

// about page
$blog->get('/about', function () use ($blog) {
  // render the about page
  $blog->render('about.html');
});

// projects page
$blog->get('/projects', function () use ($blog) {
  // render the blog page
  $blog->render('projects.html');
});

// redirect blog/page1 to root index
$blog->get('/blog/1', function () use ($blog) {
  $blog->redirect('/');
});

// blog pagination
$blog->get('/blog/:number', function ($number) use ($blog, $getMarkdownPosts) {
  // get our posts
  $posts = $getMarkdownPosts($blog->config('posts.path'));

  // determine the start position of the array
  $previous_page = $number - 1;
  $start_index = $previous_page * $blog->config('pagination');

  // limit our posts to pagination
  $posts_limit = array_slice($posts, $start_index, $blog->config('pagination'));

  // get the total number of posts
  $posts_count = count($posts);

  // calculate the number of page
  $pages_number = ceil($posts_count / $blog->config('pagination'));

  // if the requested page is too high, 401
  if($number > $pages_number) {
    $blog->notFound();
  }

  $blog->render('index.html', array(
    'posts'        => $posts_limit,
    'page_current' => $number,
    'page_count'   => $pages_number
  ));
})->conditions(array('number' => '\d+'));

// blog index
$blog->get('/blog', function() use ($blog) {
  $blog->redirect('/');
});

// post view
$blog->get('/blog/:post', function($post) use ($blog) {
  // get the posts director, and post filename
  $dir = $blog->config('posts.path');
  $post = $post . '.md';
  $post_path = $dir . '/' . $post;

  // if the post doesn't exists, 404 redirect
  if (!file_exists($post_path)) {
    $blog->notFound();
  }

  // get the post's file contents
  $post_data = file_get_contents($post_path);

  // parse the file for its meta data
  $post_data = explode('--', $post_data);

  // move the meta data into its array, and decode the json data
  $post_meta_json = array_shift($post_data);
  $post_meta = json_decode($post_meta_json, true);

  // parse the markdown portion into HTML
  $post_html = $blog->config('md')->transformMarkdown($post_data[0]);

  // build the final post object
  $post_result = array(
    'title'     => $post_meta['title'],
    'date'      => $post_meta['date'],
    'tags'      => $post_meta['tags'],
    'desc'      => $post_meta['desc'],
    'html'      => $post_html
  );

  // render the post view
  $blog->render('post.html', array('post' => $post_result));
});

// tag view
$blog->get('/blog/tagged/:tag', function ($tag) use ($blog, $getMarkdownPosts) {
  // get all the posts
  $posts = $getMarkdownPosts($blog->config('posts.path'));

  // array to hold our tagged posts
  $tagged_posts = array();

  // filter the posts
  foreach ($posts as $post) {
    // if the tag is in the post
    // push it to the new array
    if(in_array($tag, $post['tags'])) {
      array_push($tagged_posts, $post);
    }
  }

  // render the tagged view
  $blog->render('tagged.html', array(
    'tag'     => $tag,
    'posts'   => $tagged_posts
  ));
});

// custom 404 view
$blog->notFound(function () use ($blog) {
  $blog->render('404.html');
});

// --------------------------------------------------

// ------------------ RUN THE BLOG :) ---------------
$blog->run();
?>
