{
  "title": "Custom Post Taxonomies with wp_cron()",
  "date": "19-12-12",
  "tags": ["php", "wordpress"]
}
--

I recently worked on a custom Wordpress plugin that uses [wp\_cron()](http://codex.wordpress.org/Function_Reference/wp_cron) to automatically fetch data from an API and insert new posts into the Wordpress database. While working on the plugin, I ran across a small gotcha when it comes to using [custom taxonomies](http://codex.wordpress.org/Taxonomies) inside [wp\_cron()](http://codex.wordpress.org/Function_Reference/wp_cron).

### The Problem

The posts would be successfully fetched from the external API and inserted into the Wordpress database, but __without any of the taxonomy data__.

### The Cause

The problem comes from the way [wp\_insert\_post()](http://codex.wordpress.org/Function_Reference/wp_insert_post) checks user permissions while inserting posts.

Normally, when inserting posts into the database, I'll insert the post and all it's taxonomy data using [wp\_insert\_post()](http://codex.wordpress.org/Function_Reference/wp_insert_post):

    $post = array(
      'post_title'    => 'Hello World',
      'post_content'  => 'This is a post. It has words.',
      'post_type'     => 'my_custom_post_type',
      'post_status'   => 'publish',
      'tax_input'     => array(
        'my_custom_taxonomy' => array('wordpress', 'syncing')
      )
    );
    wp_insert_post($post);

Under most circumstances, this will work perfectly fine. However, if you look in the [Wordpress codex](http://codex.wordpress.org/Function_Reference/wp_insert_post) you'll find this little note:

> NOTE 4: If the current user doesn't have the capability to work with a custom taxonomy then using tax_input to add a term won't work. You will need to use wp_set_object_terms().

Turns out, that the [wp\_cron()](http://codex.wordpress.org/Function_Reference/wp_cron) function __does not__ have permissions to create/update any taxonomy by itself, and unfortunately it won't throw any errors, it will just skip the `tax_input` part of your post object.

### The Fix

Good news is that can be easily corrected by using [wp\_set\_object\_terms()](http://codex.wordpress.org/Function_Reference/wp_set_object_terms), which doesn't have the same security restrictions as [wp\_insert\_post()](http://codex.wordpress.org/Function_Reference/wp_insert_post):

    // create the object without tax_input
    $post = array(
      'post_title'    => 'Hello World',
      'post_content'  => 'This is a post. It has words.',
      'post_type'     => 'my_custom_post_type',
      'post_status'   => 'publish',
    );

    // get an id when the post is created
    $id = wp_insert_post($post);

    // now set the taxonomy
    wp_set_object_terms($id, array('wordpress', 'syncing'), 'my_custom_taxonomy');

I hope it helps!
