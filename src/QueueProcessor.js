import Queue from "./Queue";

/**
 * Queue processor will handle all the allQueues related functions
 */
export default class QueueProcessor {
    /**
     * Initialize allQueues
     */
    constructor() {
        this.queue = null;
        this.currentJob = null;
        this.failedQueue = null;
    }

    /**
     * Starting point of allQueues processing
     *
     * @param queueObj  Queue object
     */
    start(queueObj) {
        this.queue = queueObj;
        if (this.failedQueue === null) {
            const failedQueueDbAdapter = queueObj.adapter.__proto__.constructor;
            this.failedQueue = new Queue(new failedQueueDbAdapter());
        }
        this.currentJob = !this.queue.isEmpty() ? this.queue.peek() : null;
        if (!this.queue.isEmpty()) {
            this.processJob();
        }
    }

    /**
     * Execute the current job
     */
    processJob(tryCount = 1) {
        if (this.currentJob) {
            this.currentJob.execute(
                this.onJobSuccess.bind(this),
                this.onJobFail.bind(this, tryCount)
            );
        }
    }

    /**
     * start processing failed jobs
     */
    startProcessingFailedJobs() {
        this.queue.failedJobsEnqueue();
    }

    /**
     * Define job success behaviour
     */
    onJobSuccess(response) {
        this.currentJob.jobSuccess(response);
        this.queue.dequeue();
        if (this.queue.isEmpty()) {
            this.currentJob = null;
            return;
        }
        this.currentJob = this.queue.peek();
        this.processJob();
    }

    onJobFail(retryCount, response) {
        if (this.currentJob.job) {
            const {maxRetries} = this.currentJob.job;
            const {retryInterval} = this.currentJob.job;
            if (retryCount < maxRetries) {
                retryCount += 1;
                setTimeout(() => this.processJob(retryCount), retryInterval);
                return;
            }
            if (retryCount >= maxRetries){
                this.currentJob.jobFail(response);
                this.failedQueue.failedJobEnqueue(this.currentJob);
                this.queue.dequeue();
                if (this.queue.isEmpty()) {
                    this.currentJob = null;
                    return;
                }
                this.currentJob = this.queue.peek();
                this.processJob();
            }   
        }
        return;
    }
}
