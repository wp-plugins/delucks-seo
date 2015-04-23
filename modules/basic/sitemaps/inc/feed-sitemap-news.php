<?php 
global $plugin_dpc;
$module = $plugin_dpc->getModuleInstance('basic', 'sitemaps');
$query = $module->getNews(); //echo '<pre>';print_r($query);echo '</per>';

status_header('200'); // force header('HTTP/1.1 200 OK') for sites without posts
header('Content-Type: text/xml; charset=UTF-8' , true);
echo '<?xml version="1.0" encoding="UTF-8"?>';
?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" 
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
<?php while($query->have_posts()):$query->the_post(); $data = $module->getNewsData($post->ID); ?>
	<url>    
	    <loc><![CDATA[<?php the_permalink();?>]]></loc>    
	    <news:news>      
	      <news:publication>
	        <news:name><![CDATA[<?php echo $module->settings['googlenews']['name']?>]]></news:name>        
	        <news:language><?php $langs = split('_', get_locale()) ; if (isset($langs[0])) echo $langs[0];?></news:language>      
	      </news:publication>
	      
	      <?php if (isset($data['access']['Subscription'])):?>
	      <news:access>Subscription</news:access>
	      <?php elseif (isset($data['access']['Registration'])):?>
	      <news:access>Registration</news:access>
	      <?php endif;?>
	      
	      <?php if (count($data['genre']) > 0):?>
	      <news:genres><![CDATA[<?php echo implode(', ', $data['genre']); ?>]]></news:genres>   
	      <?php endif;?>
	         
	      <news:publication_date><?php echo mysql2date('Y-m-d\TH:i:s+00:00', $post->post_modified_gmt, false); ?></news:publication_date>      
	      <news:title><![CDATA[<?php the_title(); ?>]]></news:title>
	      
	      <?php if (count($data['keywords']) > 0):?>      
	      <news:keywords><?php echo implode(', ', $data['keywords']); ?></news:keywords>   
	      <?php endif; ?>
	    </news:news>  
	    
	    <?php foreach ($data['images'] as $image):?>
	    <image:image>
	    	<image:loc><?php echo $image;?></image:loc>
	    </image:image>
	    <?php endforeach;?>
	  </url>
<?php endwhile;?>
</urlset>