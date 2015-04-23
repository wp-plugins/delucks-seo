<?php 
global $plugin_dpc;
$module = $plugin_dpc->getModuleInstance('basic', 'sitemaps');
$query = $module->getImages();


status_header('200'); // force header('HTTP/1.1 200 OK') for sites without posts
header('Content-Type: text/xml; charset=UTF-8', true);
echo '<?xml version="1.0" encoding="UTF-8"?>';
?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
	xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
	xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
	<?php while($query->have_posts()): $query->the_post();?>
	<url> 
		<loc><![CDATA[<?php echo get_permalink($post->post_parent);?>]]></loc>
		<image:image>
			<image:loc><![CDATA[<?php echo $post->guid;?>]]></image:loc>
			<image:title><![CDATA[<?php echo $post->post_title;?>]]></image:title>	
		</image:image>
	</url>
	<?php endwhile;?>
</urlset>
