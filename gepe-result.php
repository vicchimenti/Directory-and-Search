<div id="search-results" class="page page--full-width program-listing" data-t4-ajax-group="gepe-courseSearch" role="main">
  <article class="listing-page">
    <section class="su-listing ea-listing">
      <!-- Cards container -->
      <div class="grid-container cards-grid">
        
        <?php if (!empty($results)) : ?>
          <?php foreach ($results as $item) : ?>
            <!-- Each card -->
            <article class="course-card">
              
              <!-- Image area -->
              <div class="card-image">
                <img 
                  src="<?php echo $item['courseImage']; ?>" 
                  alt="<?php echo $item['coursetitle']; ?>"
                >
              </div>
              
              <!-- Card text/content area -->
              <div class="card-content">
                <h3 class="card-title">
                  <a href="<?php echo $item['courselink']; ?>" target="_blank">
                    <?php echo $item['coursetitle']; ?>
                  </a>
                </h3>
                
                <div class="description">
                  <?php echo $item['coursedescription']; ?>
                </div>
                
                <!-- View Course Details button below description -->
                <?php if (!empty($item['coursesubject']) || !empty($item['coursehours'])) : ?>
                  <div class="course-tags">
                    <?php if (!empty($item['coursesubject'])) : ?>
                      <div class="tag-group">
                        <div class="tag-label">Subject</div>
                        <?php 
                          // Split the coursesubject string by "|" and display each as a tag
                          $subjects = explode('|', $item['coursesubject']);
                          foreach ($subjects as $subject) :
                            $subject = trim($subject);
                            if (!empty($subject)) :
                        ?>
                          <span class="tag"><?php echo htmlspecialchars($subject); ?></span>
                        <?php 
                            endif;
                          endforeach; 
                        ?>
                      </div>
                    <?php endif; ?>
                  </div>
                <?php endif; ?>
              </div>
            </article>
          <?php endforeach; ?>        
          
        <?php else : ?>
          <p style="text-align: center; padding: 30px; font-weight: bold;">No Results Found</p>
        <?php endif; ?>
      </div>
      <div class="pagination-box">
            <?php if (isset($paginationArray)) : ?>
              <div class="pagination-pages">
                <nav aria-label="pagination" class="pagination" data-t4-ajax-link="normal" data-t4-scroll="true">
                  <?php foreach ($paginationArray as $paginationItem) : ?>
                    <?php if ($paginationItem['current']) : ?>
                      <span class="currentpage">
                        <a href=""><?php echo $paginationItem['text']; ?></a>
                      </span>
                    <?php else : ?>
                      <a 
                        href="<?php echo $paginationItem['href']; ?>" 
                        class="<?php echo $paginationItem['class']; ?>"
                      >
                        <?php echo $paginationItem['text']; ?>
                      </a>
                    <?php endif;?>
                  <?php endforeach; ?>
                </nav>
              </div>
            <?php endif; ?>
          </div>
    </section>
  </article>
</div>
